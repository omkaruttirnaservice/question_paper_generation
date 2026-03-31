import { useMutation } from '@tanstack/react-query';
import { useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { singleCandiatePaper } from './gen-reports-api';

const PDFGenerator = () => {
    /**
     * roll => student roll number
     * ptid => published test id
     */
    const { roll, ptid } = useParams();
    console.log(roll, ptid);
    if (!roll) {
        return <p>Invalid roll number</p>;
    }

    const [qpDetails, setQpDetails] = useState({
        quePaper: [],
        studExam: {},
    });
    const { mutate: _singleCandidatePaper, isPending } = useMutation({
        mutationFn: (data) => singleCandiatePaper(data),
        onSuccess: (data) => {
            console.log(data.data);
            setQpDetails({
                quePaper: data?.data?.quePaper || [],
                studExam: data?.data?.studExam || {},
            });
        },
        onError: (err) => {
            console.log(err, '==err==');
            toast.error(err?.message || 'Server error');
        },
    });

    useLayoutEffect(() => {
        _singleCandidatePaper({
            studentRollNumber: roll,
            publishedTestId: ptid,
        });
    }, []);
    if (isPending) {
        return <p>Loading...</p>;
    }
    const {
        sfrs_student_roll_no,
        sfrs_student_id,
        sfrs_dob,
        sfrs_test_date,
        sfrs_test_info,
        mt_name,
        mt_total_marks,
        sfrs_marks_gain,
        sl_date_of_birth,

        sl_post,
        sl_application_number,
        full_name,
    } = qpDetails.studExam;

    if (qpDetails.quePaper.length === 0) {
        return <p>No question paper found</p>;
    }

    return (
        <div className="p-6  ">
            {/* Component to be captured */}
            <div className="p-4 bg-white shadow-md rounded-md w-full max-w-4xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Candidate Question Paper</h2>
                {/* 📌 Header Section */}
                {qpDetails.studExam && (
                    <div className="mb-6 grid grid-cols-2 gap-y-2 gap-x-6 border p-4 rounded-md text-sm text-gray-700">
                        <div className="col-span-2">
                            <strong>Name :</strong> {full_name || 'N/A'}
                        </div>
                        <div>
                            <strong>Exam Name:</strong> {mt_name || 'N/A'}
                        </div>
                        <div>
                            <strong>Exam Date:</strong> {sfrs_test_date || 'N/A'}
                        </div>
                        <div>
                            <strong>Student Roll No:</strong> {sfrs_student_roll_no || 'N/A'}
                        </div>
                        <div>
                            <strong>Application ID:</strong> {sl_application_number || 'N/A'}
                        </div>
                        <div>
                            <strong>Birth Date:</strong> {sl_date_of_birth || 'N/A'}
                        </div>

                        <div>
                            <strong>Post Name:</strong> {sl_post || 'N/A'}
                        </div>

                        <div>
                            <strong>Marks Obtained:</strong> {sfrs_marks_gain || 'N/A'}
                        </div>

                        <div>
                            <strong>Total Marks:</strong> {mt_total_marks || 'N/A'}
                        </div>
                    </div>
                )}

                {qpDetails.quePaper.length > 0 &&
                    qpDetails.quePaper.map((q, idx) => (
                        <div key={idx} className="border p-4 rounded-md shadow-sm">
                            <p className="font-medium mb-2">
                                Q{idx + 1}.{' '}
                                <span
                                    className="inline-block"
                                    dangerouslySetInnerHTML={{ __html: q.q }}
                                />
                            </p>
                            <div className="pl-4 space-y-1">
                                {q.q_a && (
                                    <p
                                        className={`${q.sqp_ans === 'a' ? 'font-medium text-gray-900' : ''
                                            }`}>
                                        <span>A.</span>
                                        <span
                                            className="inline-block"
                                            dangerouslySetInnerHTML={{ __html: q.q_a }}
                                        />
                                    </p>
                                )}
                                {q.q_b && (
                                    <p
                                        className={`${q.sqp_ans === 'b' ? 'font-medium text-gray-900' : ''
                                            }`}>
                                        B.{' '}
                                        <span
                                            className="inline-block"
                                            dangerouslySetInnerHTML={{ __html: q.q_b }}
                                        />
                                    </p>
                                )}
                                {q.q_c && (
                                    <p
                                        className={`${q.sqp_ans === 'c' ? 'font-medium text-gray-900' : ''
                                            }`}>
                                        C.{' '}
                                        <span
                                            className="inline-block"
                                            dangerouslySetInnerHTML={{ __html: q.q_c }}
                                        />
                                    </p>
                                )}
                                {q.q_d && (
                                    <p
                                        className={`${q.sqp_ans === 'd' ? 'font-medium text-gray-900' : ''
                                            }`}>
                                        D.{' '}
                                        <span
                                            className="inline-block"
                                            dangerouslySetInnerHTML={{ __html: q.q_d }}
                                        />
                                    </p>
                                )}
                                {q.q_e && (
                                    <p
                                        className={`${q.sqp_ans === 'e' ? 'font-medium text-gray-900' : ''
                                            }`}>
                                        E.{' '}
                                        <span
                                            className="inline-block"
                                            dangerouslySetInnerHTML={{ __html: q.q_e }}
                                        />
                                    </p>
                                )}
                            </div>
                            <div className="mt-2 text-sm text-gray-800 border justify-center flex items-center gap-6">

                                {q.is_objection_question === 1 && <p>Updated for objection</p>}
                                <p>
                                    Correct Answer: <strong>{q?.q_ans?.toUpperCase() || '-'}</strong>
                                </p>
                                <p>
                                    Your Answer: <strong>{q?.sqp_ans?.toUpperCase() || '-'}</strong>
                                </p>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default PDFGenerator;
