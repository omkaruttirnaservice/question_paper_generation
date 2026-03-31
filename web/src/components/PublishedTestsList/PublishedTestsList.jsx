let SERVER_IP = import.meta.env.VITE_API_SERVER_IP;
import React, { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaEye, FaPlus, FaXmark } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import useHttp from '../Hooks/use-http.jsx';
import CButton from '../UI/CButton.jsx';
import { H1, H3 } from '../UI/Headings.jsx';
import './TestsList.css';
import { testsSliceActions } from '../../Store/tests-slice.jsx';
import Swal from 'sweetalert2';
import { confirmDialouge } from '../../helpers/confirmDialouge.jsx';
import DataTable from 'react-data-table-component';
import { TEST_LIST_MODE } from '../Utils/Constants.jsx';
import { InputSelect } from '../UI/Input.jsx';

function PublishedTestsList() {
    const { sendRequest } = useHttp();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [publishedTestsList, setPublishedTestsList] = useState([]);

    const [publishedExamDates, setPublishedExamDates] = useState([]);
    const [loading, setLoading] = useState(false)

    const [listMode, setListMode] = useState("NEW")
    const [examDate, setExamDate] = useState("ALL")

    useEffect(() => {
        getExamsList();
    }, [listMode, examDate]);

    useEffect(() => {
        getPublishedExamDatesOnly()
    }, [])

    function getExamsList() {

        const reqData = {
            url: SERVER_IP + `/api/test/list-published?type=EXAM&mode=${listMode}`,
        };
        if (examDate !== "ALL") {
            reqData.url += `&examDate=${examDate}`
        }

        sendRequest(reqData, ({ data }) => {
            setLoading(false)
            if (data.length >= 1) {
                setPublishedTestsList(data);
            } else {
                setPublishedTestsList([]);
            }
        });
    }


    function getPublishedExamDatesOnly() {
        /**
         * Get the published exam dates only * 
         */
        const reqData = {
            url: SERVER_IP + `/api/test/dates-published`,
        };
        setLoading(true)
        sendRequest(reqData, ({ data }) => {
            setLoading(false)
            if (data.length >= 1) {
                console.log(data, 'data');
                setPublishedExamDates(data);
            } else {
                setPublishedExamDates([]);
            }
        });
    }

    function isExamToday(date) {
        const [e_date, e_month, e_year] = date?.split('-');
        let examDate = new Date(`${e_year}-${e_month}-${e_date}`);
        examDate.setHours(0, 0, 0, 0);
        let examDateTime = examDate.getTime();

        let todaysDate = new Date();
        todaysDate.setHours(0, 0, 0, 0);
        let todaysDateTime = todaysDate.getTime();

        if (examDateTime > todaysDateTime) return 2;
        else if (examDateTime == todaysDateTime) return 1;
        else if (examDateTime < todaysDateTime) return -1;
    }

    const handlePublishedTestQuePreview = (el) => {
        if (!el.id) return false;
        el.mode = TEST_LIST_MODE.PUBLISHED_TEST_LIST;
        dispatch(testsSliceActions.setTestDetails(el));
        navigate('/tests/published/questions');
    };

    const handleUnpublishExam = async (el) => {
        if (!el.id) return false;

        const isConfirm = await confirmDialouge({
            title: 'Are you sure?',
            text: 'Do you want to unpublish exam?',
        });
        if (!isConfirm) return false;

        let rD = {
            url: SERVER_IP + '/api/test/unpublish',
            method: 'DELETE',
            body: JSON.stringify({ id: el.id }),
        };
        sendRequest(rD, ({ success, data }) => {
            if (success == 1) {
                Swal.fire({
                    title: 'Success',
                    text: 'Unpublished the exam',
                    icon: 'success',
                });
                setPublishedTestsList(publishedTestsList.filter((_el) => _el.id != el.id));
            }
        });
    };

    const columns = [
        {
            sortable: true,
            name: 'Paper',
            selector: (row, idx) => idx + 1,
            width: '5rem',
        },
        {
            sortable: true,
            name: 'Published test id',
            selector: (row) => row.id,
        },
        {
            sortable: true,
            name: 'Test Name',
            selector: (row) => row.mt_name,
        },

        {
            sortable: true,
            name: 'Batch',
            selector: (row) => 'Batch-' + row.tm_allow_to,
        },
        {
            sortable: true,
            name: 'Duration',
            selector: (row) => row.mt_test_time,
        },
        {
            sortable: true,
            name: 'Total Questions',
            selector: (row) => row.mt_total_test_question,
        },
        {
            sortable: true,
            name: 'Test Date',
            selector: (row) => row.ptl_active_date,
        },

        {
            sortable: true,
            name: 'Posts',
            width: '190px',
            cell: (row) => {
                return (
                    <div className="flex flex-col gap-2">
                        {row.post_details.map((_post, idx) => (
                            <mark key={idx} className="me-1 p-1">
                                {_post.post_name}
                            </mark>
                        ))}
                    </div>
                );
            },
        },

        {
            sortable: true,
            name: 'Scheduled',
            cell: (row) => (
                <>
                    {isExamToday(row.ptl_active_date) === 1 && (
                        <span className="bg-gradient-to-tr from-indigo-500 to-indigo-600 p-1 text-white shadow-md text-xs">
                            Today
                        </span>
                    )}
                    {isExamToday(row.ptl_active_date) === 2 && (
                        <span className="bg-gradient-to-tr from-green-500 to-green-600 p-1 text-white shadow-md text-xs">
                            Upcomming
                        </span>
                    )}

                    {![1, 2].includes(isExamToday(row.ptl_active_date)) && <p>-</p>}
                </>
            ),
        },
        {
            sortable: true,
            name: 'Unpublish',
            cell: (row) => (
                <>
                    {isExamToday(row.ptl_active_date) === 2 && (
                        <CButton
                            icon={<FaXmark />}
                            onClick={handleUnpublishExam.bind(null, row)}></CButton>
                    )}

                    {isExamToday(row.ptl_active_date) !== 2 && <p>-</p>}
                </>
            ),
        },

        {
            sortable: true,
            name: 'View Questions',
            cell: (row) => (
                <>
                    <CButton
                        className="btn--info m-0"
                        onClick={handlePublishedTestQuePreview.bind(null, row)}
                        icon={<FaEye />}></CButton>
                </>
            ),
        },
    ];


    return (
        <>
            <div className="mt-6">
                <H3 className="text-center">Published Tests List</H3>


                <div className="flex">



                    <div className="w-28 p-1">
                        <span title='All gets all published test list, NEW gets only new tests' className='bg-red-200 rounded-full px-2 cursor-pointer'>i</span>
                        <InputSelect
                            label={"List mode"}
                            name="list_mode"
                            value={listMode}
                            onChange={(e) => {
                                setListMode(e.target.value)
                            }}
                        >
                            <option value="NEW">Active</option>
                            <option value="ALL">All</option>
                        </InputSelect>
                    </div>


                    <div className="w-28 p-1">
                        <span title='Show the dates of published exams' className='bg-red-200 rounded-full px-2 cursor-pointer'>i</span>
                        <InputSelect
                            label={"Exam Date"}
                            name="list_mode"
                            value={examDate}
                            onChange={(e) => {
                                setExamDate(e.target.value)
                            }}
                        >

                            <option value="ALL">ALL</option>
                            {publishedExamDates.length === 0 &&
                                <option value="">No dates found</option>
                            }

                            {publishedExamDates.length !== 0 &&
                                publishedExamDates.map((date, idx) => <option key={idx} value={date.ptl_active_date}>{date.ptl_active_date}</option>
                                )
                            }
                        </InputSelect>
                    </div>

                </div>

                {loading && <p className='text-center bg-red-50 p-1'>Loading tests...</p>}

                {publishedTestsList.length === 0 && !loading && <p className='text-center bg-red-50 p-1'>No tests list found</p>}

                {publishedTestsList.length > 0 &&
                    <DataTable
                        columns={columns}
                        data={publishedTestsList}
                        pagination
                        highlightOnHover
                    />
                }
            </div >
        </>
    );
}

export default PublishedTestsList;
