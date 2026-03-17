import { toast } from 'react-toastify';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { reportsAction } from '../../../Store/reports-slice.jsx';
import CButton from '../../UI/CButton.jsx';
import {
    getCandidateResponseSheet,
    getCustomResultExcel,
    getExamDates,
    getResultBatchesList,
    getResultViewData,
    singleCandiatePaper,
} from './gen-reports-api.jsx';
import { InputSelect } from '../../UI/Input.jsx';
import { RESULT_BY_BATCH, RESULT_BY_POST, SERVER_IP } from '../../Utils/Constants.jsx';
import { FiEye } from 'react-icons/fi';

function ViewReports() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { singleStudentViewReport, currentViewTestDetails } = useSelector(
        (state) => state.reports
    );

    const [postsList, setPostList] = useState([]);

    const [showPercentileResult, setShowPercentileResult] = useState(false);

    const [examDates, setExamDates] = useState([]);

    const _getExamDatesList = useQuery({
        queryKey: ['get-exam-dates'],
        queryFn: () => getExamDates(),

        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
    });

    const _getResultBatchesList = useQuery({
        queryKey: ['get-result-batches-list'],
        queryFn: () => getResultBatchesList(),

        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
    });

    useEffect(() => {
        if (currentViewTestDetails?.viewResultBy === RESULT_BY_POST) {
            _getResultBatchesList.refetch();
        }
        if (currentViewTestDetails?.viewResultBy === RESULT_BY_BATCH) {
            _getExamDatesList.refetch();
        }
    }, [currentViewTestDetails?.viewResultBy]);

    useEffect(() => {
        if (_getResultBatchesList?.data) {
            setPostList(_getResultBatchesList.data.data);
        }
        if (_getExamDatesList?.data) {
            setExamDates(_getExamDatesList.data.data);
        }
    }, [_getResultBatchesList, _getExamDatesList]);

    const columns = [
        {
            sortable: true,
            name: '#',
            cell: (row, idx) => <p>{idx + 1}</p>,
            width: '6%',
        },
        {
            sortable: true,
            name: 'Student name',
            selector: (row) => row['full_name'],
            width: '20%',
        },
        {
            sortable: true,
            name: 'Roll No',
            selector: (row) => row.sfrs_student_roll_no,
        },

        {
            sortable: true,
            name: 'Gender',
            selector: (row) => row.sl_gender,
        },
        {
            sortable: true,
            name: 'Unattempted',
            selector: (row) => row.sfrs_unattempted,
        },
        {
            sortable: true,
            name: 'Attempt',
            selector: (row) => Number(row.sfrc_total_marks) - Number(row.sfrs_unattempted) || '-',
        },
        { sortable: true, name: 'Wrong', selector: (row) => row.sfrs_wrong },
        { sortable: true, name: 'Correct', selector: (row) => row.sfrs_correct },
        {
            sortable: true,
            name: 'Score',
            cell: (row) => {
                return showPercentileResult ? (
                    <span>{row.srfs_percentile}</span>
                ) : (
                    <span>{row.sfrs_marks_gain + ' / ' + row.sfrc_total_marks}</span>
                );
            },
        },
        {
            sortable: true,
            name: 'Action',
            width: '13%',
            cell: (row) => (
                <CButton
                    className="text-xs"
                    onClick={handleCandidateViewReport.bind(null, row)}
                    isLoading={candidateReportViewLoading}
                    icon={<FiEye />}>
                    Report
                </CButton>
            ),
        },
    ];

    const { mutate: _singleCandidatePaper, isPending: candidateReportViewLoading } = useMutation({
        mutationFn: (data) => singleCandiatePaper(data),
        onSuccess: (data) => {
            dispatch(reportsAction.setSingleStudentViewReport(data.data));
        },
        onError: (err) => {
            console.log(err, '==err==');
            toast.error(err?.message || 'Server error');
        },
    });

    useEffect(() => {
        if (singleStudentViewReport?.quePaper?.length >= 1 && singleStudentViewReport?.studExam) {
            navigate('/reports/single');
        }
    }, [singleStudentViewReport]);

    const handleCandidateViewReport = async (data) => {
        _singleCandidatePaper({
            studentRollNumber: data.sfrs_student_id,
            publishedTestId: data.sfrs_publish_id,
        });
    };

    const _getResultViewDataMutation = useMutation({
        mutationFn: (type) => {
            return getResultViewData(type);
        },
        onSuccess: (data) => {
            const updatedData = { ...currentViewTestDetails };
            updatedData['studentResultList'] = data.data[0].result_data?.candidate_results || [];
            const { page, limit, total_pages, total_rows } = data.data[0].result_data.pagination;
            updatedData['page'] = page;
            updatedData['limit'] = limit;
            updatedData['totalRows'] = total_rows;
            updatedData['totalPages'] = total_pages;
            dispatch(reportsAction.setCurentViewTestDetails(updatedData));
        },
        onError: (error) => {
            console.log(error, '==error==');
            toast.error(error?.message || 'Server error');
        },
    });

    const handleGetResultData = () => {
        const _data = {};
        if (currentViewTestDetails?.viewResultBy === RESULT_BY_POST) {
            _data.viewResultBy = RESULT_BY_POST;
            _data.postName = currentViewTestDetails.selectedPost;
        }

        if (currentViewTestDetails?.viewResultBy === RESULT_BY_BATCH) {
            _data.viewResultBy = RESULT_BY_BATCH;
            _data.postName = currentViewTestDetails?.selectedPost;
            _data.examDate = currentViewTestDetails?.selectedExamDate;
        }

        _data.page = currentViewTestDetails.page;
        _data.limit = currentViewTestDetails.limit;

        _getResultViewDataMutation.mutate(_data);
    };

    const handlePageChange = (newPage) => {
        const updatedData = { ...currentViewTestDetails };
        updatedData['page'] = newPage;
        dispatch(reportsAction.setCurentViewTestDetails(updatedData));
    };

    const handleChangeRowsPerPage = (currentRowsPerPage, currentPage) => {
        const updatedData = { ...currentViewTestDetails };
        updatedData['page'] = 1;
        updatedData['limit'] = currentRowsPerPage || 10;
        dispatch(reportsAction.setCurentViewTestDetails(updatedData));
    };

    useEffect(() => {
        handleGetResultData();
    }, [currentViewTestDetails.page, currentViewTestDetails.limit]);

    const handleChange = (e) => {
        let updatedList = { ...currentViewTestDetails };

        let name = e.currentTarget.name;
        let value = e.currentTarget.value;
        updatedList = {
            ...updatedList,
            studentResultList: [],
            [name]: value,
        };
        dispatch(reportsAction.setCurentViewTestDetails(updatedList));
    };

    const _getResultExel = useMutation({
        mutationFn: (data) => {
            return getCustomResultExcel(data);
        },
        onSuccess: (data) => { },
        onError: (error) => {
            console.log(error.message, '==error==');
            toast.error(error?.message || 'Server error');
        },
    });

    const handleGetExcelBtn = () => {
        const _data = {};
        if (currentViewTestDetails?.viewResultBy === RESULT_BY_POST) {
            _data.viewResultBy = RESULT_BY_POST;
            _data.postName = currentViewTestDetails?.selectedPost;
            _data.resultType = showPercentileResult ? 'PERCENTILE' : 'MARKS';
        }

        if (currentViewTestDetails?.viewResultBy === RESULT_BY_BATCH) {
            _data.viewResultBy = RESULT_BY_BATCH;
            _data.postName = currentViewTestDetails?.selectedPost;
            _data.examDate = currentViewTestDetails?.selectedExamDate;
            _data.resultType = showPercentileResult ? 'PERCENTILE' : 'MARKS';
        }
        _getResultExel.mutate(_data);
    };


    const _getResponsePdf = useMutation({
        mutationFn: () => {
            return getCandidateResponseSheet();
        },
        onSuccess: (data) => { },
        onError: (error) => {
            console.log(error.message, '==error==');
            toast.error(error?.message || 'Server error');
        },
    });

    const handleGetResponsePdf = () => {

        _getResponsePdf.mutate();
    };

    return (
        <>
            <section className="grid grid-cols-6 mt-6 mb-2 gap-2">
                <div>
                    <InputSelect
                        label="View Result By"
                        className={'w-full'}
                        name="viewResultBy"
                        value={currentViewTestDetails?.viewResultBy || RESULT_BY_BATCH}
                        onChange={handleChange}>
                        <option value={RESULT_BY_BATCH}>{RESULT_BY_BATCH}</option>
                        <option value={RESULT_BY_POST}>{RESULT_BY_POST}</option>
                    </InputSelect>
                </div>

                {currentViewTestDetails?.viewResultBy === RESULT_BY_BATCH && (
                    <div>
                        <InputSelect
                            label="Exam Dates"
                            className={'w-full'}
                            name="selectedExamDate"
                            value={currentViewTestDetails?.selectedExamDate || ''}
                            onChange={handleChange}>
                            <option value="">--Select Exam Date--</option>
                            {examDates?.length > 0 &&
                                examDates.map((date) => {
                                    return (
                                        <option value={date.sl_exam_date}>
                                            {date.sl_exam_date}
                                        </option>
                                    );
                                })}
                        </InputSelect>
                    </div>
                )}

                <div>
                    <InputSelect
                        label="Posts"
                        className={'w-full'}
                        name="selectedPost"
                        value={currentViewTestDetails?.selectedPost || ''}
                        onChange={handleChange}>
                        <option value="">--Select Post--</option>
                        {postsList?.length > 0 &&
                            postsList.map((post) => {
                                return <option value={post.sl_post}>{post.sl_post}</option>;
                            })}
                    </InputSelect>
                </div>

                <div className="self-end col-span-3">
                    <div className="flex gap-2">
                        <CButton
                            onClick={handleGetResultData}
                            isLoading={_getResultViewDataMutation.isPending}>
                            View Result
                        </CButton>

                        <CButton
                            varient={'btn--warning'}
                            onClick={handleGetExcelBtn}
                            isLoading={_getResultExel.isPending}>
                            Excel
                        </CButton>

                        {/* <CButton
                            varient={'btn--warning'}
                            onClick={handleGetResponsePdf}

                        >
                            Response Pdf
                        </CButton> */}
                        <a href={`${SERVER_IP}/api/pdf/v3/candidate-response-sheet`}>
                            Download Pdf Stream
                        </a>

                        <div className="flex items-center gap-2">
                            <label htmlFor="" for="percentile-result">
                                Percentile
                            </label>
                            <input
                                type="checkbox"
                                id="percentile-result"
                                onClick={() => {
                                    setShowPercentileResult(!showPercentileResult);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <p className="text-red-500 text-sm pb-3">
                Note: The negative marking is only calculated for wrong answered questions.
            </p>

            <DataTable
                columns={columns}
                data={currentViewTestDetails?.studentResultList || []}
                pagination
                highlightOnHover
                paginationServer
                paginationTotalRows={currentViewTestDetails?.totalRows || 0}
                paginationDefaultPage={currentViewTestDetails?.page || 0}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                paginationComponentOptions={{
                    rowsPerPageText: 'Total Per Page',
                    rangeSeparatorText: '--',
                }}
            />
        </>
    );
}

export default ViewReports;
