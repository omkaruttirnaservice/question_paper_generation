import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

let SERVER_IP = import.meta.env.VITE_API_SERVER_IP;

import { FaAngleRight, FaGripLinesVertical } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
    EditQuestionFormActions,
    getBooksListThunk,
    getPublicationsListThunk,
    getSubjectsListThunk,
    getTopicsListThunk,
} from '../../Store/edit-question-form-slice.jsx';
import { ModalActions } from '../../Store/modal-slice.jsx';
import { getQuestionsListThunk } from '../../Store/tests-slice.jsx';
import useHttp from '../Hooks/use-http';
import CButton from '../UI/CButton.jsx';
import CModal from '../UI/CModal.jsx';
import AddBookModal from './AddBook/AddBookModal.jsx';
import AddPublicationModal from './AddPublication/AddPublicationModal.jsx';
import BookNameDropdown from './BookNameDropdown/BookNameDropdown.jsx';
import DifficultyLevelDropdown from './DifficultyLevelDropdown/DifficultyLevelDropdown.jsx';
import EditQuestionExplanationInput from './EditQuestionExplanationInput.jsx';
import EditQuestionOptionsInput from './EditQuestionFormOptions.jsx';
import PublicationNameDropdown from './PublicationNameDropdown/PublicationNameDropdown.jsx';
import QuestionMonthDropdown from './QuestionMonthDropdown/QuestionMonthDropdown.jsx';
import QuestionPgNo from './QuestionPgNo/QuestionPgNo.jsx';
import QuestionYearDropdown from './QuestionYearDropdown/QuestionYearDropdown.jsx';
import editQuestionFormSchemaYUP from './editQuestionFormSchemaYUP.jsx';

const EditAddQuestionForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { sendRequest } = useHttp();

    let {
        data: _formData,
        isUpdateToMaster,
        isUpdateToMasterPersist,
        isObjectionUpdate
    } = useSelector((state) => state.questionForm);
    const { testDetails } = useSelector((state) => state.tests);

    const [showNewInputField, setShowNewInputField] = useState(false);

    useEffect(() => {
        dispatch(getPublicationsListThunk(sendRequest));
    }, []);

    useEffect(() => {
        dispatch(getSubjectsListThunk(_formData.post_id, sendRequest));
    }, [_formData.post_id]);

    useEffect(() => {
        dispatch(getTopicsListThunk(_formData.subject_id, sendRequest));
    }, [_formData.subject_id]);

    useEffect(() => {
        dispatch(getBooksListThunk(_formData.pub_name, sendRequest));
    }, [_formData.pub_name]);

    const handleUpdateQuestion = async (e) => {
        e.preventDefault();

        try {
            await editQuestionFormSchemaYUP.validate(_formData, {
                abortEarly: false,
            });

            if (isUpdateToMaster && !isUpdateToMasterPersist) {
                dispatch(ModalActions.toggleModal('confirm-update-to-master-modal'));
            } else {
                postQuestionData();
            }
            dispatch(EditQuestionFormActions.setErrors({}));
        } catch (error) {
            console.log(error, 'error');
            const errorsObj = {};
            error.inner.forEach((el) => {
                errorsObj[el.path] = el.message;
            });
            dispatch(EditQuestionFormActions.setErrors(errorsObj));
        }
    };

    async function postQuestionData() {


        // Setting is objection update status
        let updateQuestionData = {
            ..._formData,
        }
        let reqData = {
            url: `${SERVER_IP}/api/test/update-test-question?isMasterUpdate=${isUpdateToMaster}&isObjectionUpdate=${isObjectionUpdate}`,
            method: 'PUT',
            body: JSON.stringify(updateQuestionData),
        };
        sendRequest(reqData, (data) => {
            if (data.success == 1) {
                toast('Successfully updated question');
                Swal.fire({
                    title: 'Success',
                    text: 'Updated question details',
                    icon: 'success',
                });

                dispatch(getQuestionsListThunk(testDetails.test_id, sendRequest, navigate));
                dispatch(ModalActions.toggleModal('edit-que-modal'));
                dispatch(EditQuestionFormActions.resetFormData());
            }
        });
    }

    return (
        <>
            <AddPublicationModal />
            <AddBookModal />
            <div className="container mx-auto border  relative">
                <form id="add-question-form" className="grid gap-6">
                    <div className={`bg-white sticky top-0 z-10`}>
                        <div className="container mx-auto mb-3">
                            <div className="bg-cyan-100  border-t-sky-700 border-t-4 p-3">
                                <div className="grid grid-cols-4 items-center gap-1">
                                    <div className="flex items-center gap-1">
                                        <FaGripLinesVertical />
                                        <p>Subject Name</p>
                                        <FaAngleRight />
                                        <span className="underline">{_formData.subject_name}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <FaGripLinesVertical />
                                        <p>Topic Name</p>
                                        <FaAngleRight />
                                        <span className="underline">{_formData.topic_name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                            <DifficultyLevelDropdown />
                            <PublicationNameDropdown />
                            <BookNameDropdown />
                            <QuestionPgNo />
                            <QuestionMonthDropdown />
                            <QuestionYearDropdown />
                        </div>
                    </div>

                    <hr />

                    <div className="flex flex-col gap-3">
                        <EditQuestionOptionsInput
                            showNewInputField={showNewInputField}
                            setShowNewInputField={setShowNewInputField}
                        />
                    </div>

                    <hr />

                    <EditQuestionExplanationInput />

                    <div className="sticky bottom-5 right-0">
                        <div className="flex justify-end gap-4">

                            <div className="flex items-center gap-3 ">
                                <label htmlFor="objection-update" className="cursor-pointer">
                                    Update for objection
                                </label>
                                <input
                                    type="checkbox"
                                    id="objection-update"
                                    className="cursor-pointer"
                                    checked={isObjectionUpdate}
                                    onClick={(e) => {
                                        dispatch(
                                            EditQuestionFormActions.setObjectionUpdate(!isObjectionUpdate)
                                        );
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-3 ">
                                <label htmlFor="master-update" className="cursor-pointer">
                                    Update to master
                                </label>
                                <input
                                    type="checkbox"
                                    id="master-update"
                                    className="cursor-pointer"
                                    checked={isUpdateToMaster}
                                    onClick={(e) => {
                                        dispatch(
                                            EditQuestionFormActions.setUpdateToMaster({
                                                isUpdateToMaster: e.currentTarget.checked,
                                                isUpdateToMasterPersist: isUpdateToMasterPersist,
                                            })
                                        );
                                    }}
                                />
                            </div>
                            <CButton
                                onClick={handleUpdateQuestion}
                                className="w-[10%] flex justify-center items-center "
                                type="button"
                                isLoading={useSelector((state) => state.loader.isLoading)}>
                                Update
                            </CButton>
                        </div>
                    </div>
                </form>
            </div>

            <ConfirmUpdateToMasterModal postQuestionData={postQuestionData} />
        </>
    );
};

function ConfirmUpdateToMasterModal({ postQuestionData }) {
    const dispatch = useDispatch();

    return (
        <>
            <CModal
                id={'confirm-update-to-master-modal'}
                title={'Warning'}
                className="!w-[14rem] h-fit">
                <p>The question will also get updated to master question.</p>
                <p>Do you want to continue?</p>

                <div className="flex gap-3 justify-center mt-3">
                    <CButton
                        onClick={() => {
                            dispatch(
                                EditQuestionFormActions.setUpdateToMaster({
                                    isUpdateToMaster: false,
                                    isUpdateToMasterPersist: false,
                                })
                            );
                            dispatch(ModalActions.toggleModal('confirm-update-to-master-modal'));
                            postQuestionData();
                        }}>
                        Allow once
                    </CButton>
                    <CButton
                        className={'btn--success'}
                        onClick={() => {
                            dispatch(
                                EditQuestionFormActions.setUpdateToMaster({
                                    isUpdateToMaster: true,
                                    isUpdateToMasterPersist: true,
                                })
                            );
                            dispatch(ModalActions.toggleModal('confirm-update-to-master-modal'));
                            postQuestionData();
                        }}>
                        Don't ask again and continue
                    </CButton>
                    <CButton
                        className={'btn--warning text-gray-800 '}
                        onClick={() => {
                            dispatch(ModalActions.toggleModal('confirm-update-to-master-modal'));
                        }}>
                        No
                    </CButton>
                </div>
            </CModal>
        </>
    );
}

export default EditAddQuestionForm;
