import { memo, useEffect, useState } from 'react';
import {
    FaArrowAltCircleLeft,
    FaArrowAltCircleRight,
    FaBackspace,
    FaEye,
    FaPlus,
    FaPrint,
} from 'react-icons/fa';
import { FaListUl, FaSpinner, FaUpRightAndDownLeftFromCenter } from 'react-icons/fa6';
import { GoPencil } from 'react-icons/go';
import { IoGridOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { EditQuestionFormActions } from '../../Store/edit-question-form-slice.jsx';
import { ModalActions } from '../../Store/modal-slice.jsx';
import { getQuestionsListThunk } from '../../Store/tests-slice.jsx';
import useHttp from '../Hooks/use-http.jsx';
import PDFGenerator from '../Reports/GenerateRports/PDFGen.jsx';
import CButton from '../UI/CButton.jsx';
import CModal from '../UI/CModal.jsx';
import { H2 } from '../UI/Headings.jsx';
import {
    _questionListView,
    EDIT_QUESTION_OF_GENERATED_TEST,
    EDIT_QUESTION_OF_PUBLISHED_TEST,
    SERVER_IP,
    TEST_LIST_MODE,
} from '../Utils/Constants.jsx';
import EditQuestionView from './EditQuestionView.jsx';
import { renderTopicHeader } from './utils.js';
import { InputSelect } from '../UI/Input.jsx';
import Swal from 'sweetalert2';
import { sweetAlertConfirm } from '../Utils/utils.jsx';

function TestQuestionsView() {
    const [questionListView, setQuestionListView] = useState(_questionListView.SPLIT);
    const { questionsList, testDetails } = useSelector((state) => state.tests);
    const { sendRequest } = useHttp();
    const dispatch = useDispatch();
    const navigate = useNavigate();


    useEffect(() => {
        dispatch(getQuestionsListThunk(testDetails.test_id, sendRequest, navigate));
    }, [testDetails.test_id]);

    console.log(testDetails.pub_test_id);

    const handleEditQuestion = (el) => {
        if (testDetails.mode == TEST_LIST_MODE.TEST_LIST) {
            dispatch(
                EditQuestionFormActions.setEditQuestionDetails({
                    el,
                    edit_for: EDIT_QUESTION_OF_GENERATED_TEST,
                }),
            );
        }
        if (testDetails.mode == TEST_LIST_MODE.PUBLISHED_TEST_LIST) {
            dispatch(
                EditQuestionFormActions.setEditQuestionDetails({
                    el,
                    edit_for: EDIT_QUESTION_OF_PUBLISHED_TEST,
                }),
            );
        }
        dispatch(ModalActions.toggleModal('edit-que-modal'));
    };

    const handleUpdateObjection = async (el) => {
        if (!await sweetAlertConfirm('Are you sure?', 'Do you want to apply objection for this question!')) return


        let reqData = {
            url: SERVER_IP + '/api/test/apply-objection',
            method: 'POST',
            body: JSON.stringify({
                tqs_question_id: el.q_id,
                pub_test_id: testDetails.pub_test_id,
                correct_answer: el.q_ans
            }),
        };
        sendRequest(reqData, ({ success, data }) => { });

    };

    const [listMode, setListMode] = useState("ALL")
    const [filteredQuestionList, setFilteredQuestionList] = useState(questionsList ?? [])

    useEffect(() => {
        setFilteredQuestionList(questionsList)
    }, [questionsList])

    useEffect(() => {
        // we will filter out the questions as per list mode
        // ALL => show all questions
        // OBJECTION => filter out questions who has been marked as objection
        if (listMode === 'OBJECTION') {
            let filteredList = questionsList.filter(question => question.is_objection_question === 1)
            console.log(filteredList);
            setFilteredQuestionList(filteredList)
        } else {
            setFilteredQuestionList(questionsList)
        }
    }, [listMode, questionsList])

    return (
        <>
            <EditQuestionView />
            <CModal id={'view-pdf-modal'} title={'Questions Print List'} className={`min-w-[95vw]`}>
                <PDFGenerator questions={filteredQuestionList} testDetails={testDetails} />
            </CModal>

            <CButton
                className={
                    'fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700'
                }
                onClick={() => dispatch(ModalActions.toggleModal('view-pdf-modal'))}>
                <FaPrint />
            </CButton>

            <TestInfoHeader
                testDetails={testDetails}
                questionListView={questionListView}
                setQuestionListView={setQuestionListView}
            />


            <div className="w-48 mb-6">
                <span title='This shows the question list mode, ALL Questions, Objection Questions' className='bg-red-200 rounded-full px-2 cursor-pointer'>i</span>
                <InputSelect
                    label={"Question List mode"}
                    name="list_mode"
                    value={listMode}
                    onChange={(e) => {
                        setListMode(e.target.value)
                    }}
                >
                    <option value="ALL" >All Questions</option>
                    <option value="OBJECTION">Objection Question</option>
                </InputSelect>
            </div>



            {filteredQuestionList.length === 0 && (
                <div className="flex justify-center py-20">
                    No questions found.
                </div>
            )}


            {questionListView === _questionListView.SPLIT && filteredQuestionList.length !== 0 && (
                <QuestionSplitView
                    questionsList={filteredQuestionList}
                    renderTopicHeader={renderTopicHeader}
                    handleEditQuestion={handleEditQuestion}
                    handleUpdateObjection={handleUpdateObjection}
                    listMode={listMode}
                />
            )}

            {questionListView === _questionListView.EXAM_THEME_1 && filteredQuestionList.length !== 0 && (
                <ExamThemeView
                    testDetails={testDetails}
                    questionsList={filteredQuestionList}
                    renderTopicHeader={renderTopicHeader}
                    handleEditQuestion={handleEditQuestion}
                />
            )}
        </>
    );
}

function TestInfoHeader({ testDetails, questionListView, setQuestionListView }) {
    const navigate = useNavigate();
    function toggleListMode(mode) {
        setQuestionListView(mode);
    }

    return (
        <>
            <div className="container mx-auto text-center my-8 relative">
                <div
                    className="bg-white border shadow-md inline-block absolute left-0 top-0 p-3 rounded-full cursor-pointer hover:bg-gray-100"
                    onClick={() => navigate(-1)}>
                    <FaBackspace className="text-red-500 text-xl" />
                </div>

                <H2 className="mb-0 text-2xl font-bold text-gray-800">{testDetails.test_name}</H2>
            </div>

            <div className="flex justify-center gap-3 mb-6">
                <div
                    onClick={toggleListMode.bind(null, _questionListView.SPLIT)}
                    className={`p-3 rounded-md border shadow-sm cursor-pointer ${questionListView == _questionListView.SPLIT
                        ? 'bg-blue-500 text-white'
                        : 'bg-white hover:bg-gray-100'
                        }`}>
                    <FaListUl />
                </div>
                <div
                    onClick={toggleListMode.bind(null, _questionListView.EXAM_THEME_1)}
                    className={`p-3 rounded-md border shadow-sm cursor-pointer ${questionListView == _questionListView.EXAM_THEME_1
                        ? 'bg-blue-500 text-white'
                        : 'bg-white hover:bg-gray-100'
                        }`}>
                    <IoGridOutline />
                </div>
            </div>

            <div className="container mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                <PreviewTestDetails title={'Test Duration'} value={testDetails.test_duration} />
                <PreviewTestDetails
                    title={'Marks per question'}
                    value={testDetails.marks_per_question}
                />
                <PreviewTestDetails title={'Total questions'} value={testDetails.total_questions} />
                <PreviewTestDetails
                    title={'Is negative marking'}
                    value={testDetails.is_negative_marking == 0 ? 'No' : 'Yes'}
                />
                <PreviewTestDetails
                    title={'Negative marks'}
                    value={testDetails.negative_mark == 0 ? 'No' : 'Yes'}
                />
                <PreviewTestDetails title={'Passing marks'} value={testDetails.test_passing_mark} />
                <PreviewTestDetails
                    title={'Test created date'}
                    value={testDetails.test_created_on}
                />
                <PreviewTestDetails title={'Todays date'} value={testDetails.todays_date} />
            </div>
        </>
    );
}

const QuestionSplitView = memo(({ questionsList, renderTopicHeader, handleEditQuestion, handleUpdateObjection, listMode }) => {
    return (
        <div className="container mx-auto columns-1 md:columns-2 gap-6">
            {questionsList.map((el, idx) => {
                const topicHeader = renderTopicHeader(el.main_topic_name, el.sub_topic_section);
                return (
                    <div
                        className="border rounded-lg transition-all duration-300 mb-6 shadow-md bg-white hover:shadow-lg relative"
                        key={idx}>

                        {topicHeader}
                        <div className='absolute top-2 right-2 flex gap-2  '
                        >

                            <CButton
                                icon={<GoPencil />}
                                onClick={handleEditQuestion.bind(null, el)}
                                className={
                                    'text-sm px-3 py-1 rounded'
                                }>
                                Edit
                            </CButton>


                            {el?.is_objection_question === 1 && listMode === 'OBJECTION' &&
                                <CButton
                                    varient='btn--danger'
                                    icon={<FaPlus />}
                                    onClick={handleUpdateObjection.bind(null, el)}
                                    className={
                                        'text-sm px-3 py-1 rounded text-white'
                                    }>
                                    Update Objection
                                </CButton>
                            }

                        </div>

                        <QuestionUi q={el} idx={idx} />
                    </div>
                );
            })}
        </div>
    );
});

export function ExamThemeView({ testDetails, questionsList, handleEditQuestion, isEdit = true }) {
    const dispatch = useDispatch();
    const [idx, setIdx] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(questionsList[idx]);

    useEffect(() => {
        setCurrentQuestion(questionsList[idx]);
    }, [idx, questionsList]);

    return (
        <>
            {/* Trigger button */}
            <div className="flex justify-center">
                <CButton
                    icon={<FaEye />}
                    disabled={questionsList.length === 0}
                    onClick={() => {
                        dispatch(ModalActions.toggleModal('exam-theme-1-modal'));
                    }}>
                    <span>View</span>
                </CButton>
            </div>

            <CModal
                id="exam-theme-1-modal"
                title={`${testDetails.test_name || 'Exam View'}`}
                className="!w-[97vw] !h-[97vh] !z-40">
                <div className="container mx-auto p-3 border h-[85vh]">
                    <div className="grid grid-cols-7 gap-6 h-full">
                        {/* Main Question Area */}
                        <div className="col-span-5 flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto pr-2">
                                {/* {topicHeader} */}
                                <QuestionUi q={currentQuestion} idx={idx} />
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex justify-between mt-4">
                                <CButton
                                    disabled={idx === 0}
                                    className="btn--success bg-blue-500 text-white hover:bg-blue-600"
                                    icon={<FaArrowAltCircleLeft />}
                                    onClick={() => setIdx((prev) => prev - 1)}>
                                    Prev
                                </CButton>
                                {isEdit && (
                                    <CButton
                                        icon={<GoPencil />}
                                        onClick={handleEditQuestion.bind(null, currentQuestion)}
                                        className="bg-yellow-400 hover:bg-yellow-500 text-sm px-4 py-2 rounded">
                                        Edit
                                    </CButton>
                                )}
                                <CButton
                                    disabled={questionsList.length === idx + 1}
                                    className="bg-blue-500 text-white hover:bg-blue-600"
                                    icon={<FaArrowAltCircleRight />}
                                    onClick={() => setIdx((prev) => prev + 1)}>
                                    Next
                                </CButton>
                            </div>
                        </div>

                        {/* Question numbers grid */}
                        <div className="col-span-2 border border-blue-200 p-3 overflow-y-auto max-h-full">
                            <div className="grid grid-cols-5 gap-3">
                                {questionsList.map((_q, _i) => (
                                    <div
                                        key={_i}
                                        className={`border rounded-md size-10 flex items-center justify-center cursor-pointer transition ${idx === _i
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-white hover:bg-gray-100'
                                            }`}
                                        onClick={() => setIdx(_i)}>
                                        {_i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CModal>
        </>
    );
}

function QuestionUi({ idx, q }) {
    return (
        <div className="border p-4 rounded-md shadow-sm bg-gray-50">
            <div className="text-lg mb-3 text-gray-900 flex gap-1 flex-col">
                <p>Q. {idx + 1}.</p>
                <span
                    className="inline-block"
                    dangerouslySetInnerHTML={{
                        __html: q?.q || q?.mqs_question || '-',
                    }}
                />
            </div>

            <div className="pl-4 space-y-2">
                {(q?.q_a || q?.mqs_opt_one) && (
                    <QuestionOption option="A" html={q?.q_a || q?.mqs_opt_one || '-'} />
                )}
                {(q?.q_b || q?.mqs_opt_two) && (
                    <QuestionOption option="B" html={q?.q_b || q?.mqs_opt_two || '-'} />
                )}
                {(q?.q_c || q?.mqs_opt_three) && (
                    <QuestionOption option="C" html={q?.q_c || q?.mqs_opt_three || '-'} />
                )}
                {(q?.q_d || q?.mqs_opt_four) && (
                    <QuestionOption option="D" html={q?.q_d || q?.mqs_opt_four || '-'} />
                )}
                {(q?.q_e || q?.mqs_opt_five) && (
                    <QuestionOption option="E" html={q?.q_e || q?.mqs_opt_five || '-'} />
                )}
            </div>

            <div className="mt-3 text-sm text-gray-700 border-t pt-2 flex justify-center">
                Correct Answer:&nbsp;
                <strong>{q?.q_ans?.toUpperCase() || q?.mqs_ans?.toUpperCase() || '-'}</strong>
            </div>
        </div>
    );
}

function QuestionOption({ option, html }) {
    return (
        <div className="flex gap-2 items-start">
            <span className="font-semibold text-gray-700">{option}.</span>
            <span
                className="inline-block text-gray-800"
                dangerouslySetInnerHTML={{
                    __html: html,
                }}
            />
        </div>
    );
}

function PreviewTestDetails({ title, value }) {
    return (
        <div className="flex flex-col bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <span className="font-semibold text-gray-700">{title}</span>
            <span className="text-gray-900">{value}</span>
        </div>
    );
}

export default TestQuestionsView;
