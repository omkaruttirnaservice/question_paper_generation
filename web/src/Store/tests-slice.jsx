let SERVER_IP = import.meta.env.VITE_API_SERVER_IP;
import { createSlice } from '@reduxjs/toolkit';
import Swal from 'sweetalert2';
import { TEST_LIST_MODE } from '../components/Utils/Constants';
import { isDevEnv } from '../components/Utils/utils';

const INITIAL_STATE_DEV = {
    isTestDetailsFilled: true,
    testDetails: {
        test_id: '',
        test_name: '',
        test_duration: '',
        marks_per_question: '',
        total_questions: '',
        is_negative_marking: 0,
        negative_mark: 0,
        test_passing_mark: '',
        test_creation_type: 'manual',
        test_created_on: '',
        todays_date: '',
        mode: '',
    },
    topicList: [],
    selectedTopicList: [],
    errors: {},
    selectedQuestionsList: [],
    sortedSelectedQuestionsList: [],
    questionsList: [],
};

const TEST_INITIAL_STATE = {
    isTestDetailsFilled: false,
    testDetails: {
        // this is for preview of test questions which are not yet published
        test_id: '',
        test_name: '',
        test_duration: '',
        marks_per_question: '',
        total_questions: '',
        is_negative_marking: 0,
        negative_mark: 0,
        test_passing_mark: '',
        test_creation_type: 'manual', // manual or auto
        test_created_on: '',
        todays_date: '',
        mode: '',
    },

    topicList: [], // this is the topic list which includes questions count as well
    selectedTopicList: [], // this is list of topics in test chart
    errors: {},
    selectedQuestionsList: [],
    sortedSelectedQuestionsList: [],

    questionsList: [],
};

const testsSlice = createSlice({
    name: 'tests-slice',
    initialState: isDevEnv() ? INITIAL_STATE_DEV : TEST_INITIAL_STATE,

    reducers: {
        setTestDetailsFilled: (state, action) => {
            state.isTestDetailsFilled = action.payload;
        },
        setTopicList: (state, action) => {
            // this is the topic list which includes questions count as well
            state.topicList = action.payload;
        },

        setSelectedTopicList: (state, action) => {
            // this is list of topics in test chart
            state.selectedTopicList = action.payload;
        },

        updateTotalQuestionsCount_AUTO_TEST: (state, action) => {
            state.testDetails.total_questions = action.payload;
        },

        setTestCreationType: (state, action) => {
            state.testDetails.test_creation_type = action.payload;
        },

        setErrors: (state, action) => {
            state.errors = action.payload;
        },

        setSelectedQuestionsList: (state, action) => {
            state.selectedQuestionsList = action.payload;
            state.testDetails.total_questions = state.selectedQuestionsList.length;
        },

        // for view questions of the test
        setTestQuestionsList: (state, action) => {
            // state.testQuestionsList = action.payload;
        },

        setTestDetailsId: (state, action) => {
            state.testDetails.test_id = action.payload;
        },

        setTestDetailsOnChange: (state, action) => {
            const { key, value } = action.payload;
            state.testDetails[key] = value;
        },

        setTestDetails: (state, { payload }) => {
            console.log('Setting up test details:', payload);
            if (payload.mode == TEST_LIST_MODE.TEST_LIST) {
                state.testDetails.mode = TEST_LIST_MODE.TEST_LIST;
                state.testDetails.test_id = payload.id;
            }
            if (payload.mode == TEST_LIST_MODE.PUBLISHED_TEST_LIST) {
                state.testDetails.mode = TEST_LIST_MODE.PUBLISHED_TEST_LIST;
                state.testDetails.test_id = payload.ptl_test_id;
            }
            state.testDetails.test_name = payload.mt_name;
            state.testDetails.test_duration = payload.mt_test_time;
            state.testDetails.marks_per_question = payload.mt_mark_per_question;
            state.testDetails.total_questions = payload.mt_total_test_question;
            state.testDetails.is_negative_marking = payload.mt_negativ_mark;
            state.testDetails.negative_mark = payload.mt_negativ_mark;
            state.testDetails.test_passing_mark = payload.mt_passing_out_of;

            state.testDetails.test_created_on = payload.mt_added_date;

            let todaysDate = new Date();
            state.testDetails.todays_date =
                todaysDate.getDate() +
                '-' +
                (todaysDate.getMonth() + 1) +
                '-' +
                todaysDate.getFullYear();
        },

        setQuestionsList: (state, action) => {
            state.questionsList = action.payload;
        },

        cleanupTestDetails: (state, payload) => {
            state.questionsList = [];
            state.testDetails = {
                test_id: null,
                test_name: null,
                test_duration: null,
                marks_per_question: null,
                total_questions: null,
                is_negative_marking: 0,
                negative_mark: 0,
                test_passing_mark: null,
                test_creation_type: null,
                test_created_on: null,
                todays_date: null,
                mode: null,
            };
        },

        // RESET
        reset(state, action) {
            state.topicList = TEST_INITIAL_STATE.topicList;
            state.selectedTopicList = [];
            state.errors = TEST_INITIAL_STATE.errors;
            state.selectedQuestionsList = TEST_INITIAL_STATE.selectedQuestionsList;
            state.sortedSelectedQuestionsList = TEST_INITIAL_STATE.sortedSelectedQuestionsList;

            state.questionsList = TEST_INITIAL_STATE.questionsList;
        },

        resetTestDetails(state, action) {
            state.testDetails = TEST_INITIAL_STATE.testDetails;
        },
    },
});

export const getQuestionsListThunk = (testId, sendRequest, navigate) => {
    return async (dispatch) => {
        let reqData = {
            url: SERVER_IP + '/api/test/questions',
            method: 'POST',
            body: JSON.stringify({ testId }),
        };
        sendRequest(reqData, ({ success, data }) => {
            if (data.length == 0) {
                Swal.fire({
                    title: 'Warning!',
                    text: 'No questions found for the test!',
                });

                navigate(-1);
                return false;
            }

            dispatch(testsSliceActions.setQuestionsList(data));
        });
    };
};

export const testsSliceActions = testsSlice.actions;
export default testsSlice;
