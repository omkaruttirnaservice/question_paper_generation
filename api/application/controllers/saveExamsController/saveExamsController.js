import sequelize from '../../config/db-connect-migration.js';
import db from '../../config/db.connect.js';
import saveExamsModel from '../../model/saveExamsModel.js';
import tm_student_final_result_set from '../../schemas/tm_student_final_result_set.js';
import tm_student_question_paper from '../../schemas/tm_student_question_paper.js';
import tm_student_test_list from '../../schemas/tm_student_test_list.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const saveExamsController = {
    saveExamData: asyncHandler(async (req, res) => {
        console.log(req.body, '==req.body==');
        let { student_list, pub_id, exam_paper } = req.body;

        if (student_list.length == 0) throw new ApiError(204, 'No students list found');

        if (exam_paper.length == 0) throw new ApiError(204, 'No exams list found');

        if (!pub_id) throw new ApiError(204, 'Invalid publish id');

        // let transact = await sequelize.transaction();

        try {
            await db.tm_student_test_list.bulkCreate(student_list, {
                // transaction: transact,
            });
            await db.tm_student_question_paper.bulkCreate(exam_paper, {
                // transaction: transact,
            });
            // await transact.commit();
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        {},
                        'Successfully uploaded students and their question paper data',
                    ),
                );
        } catch (error) {
            console.log(error, '==error==');
            // await transact.rollback();
            throw new ApiError(424, error?.message || 'Something went wrong on server');
        }
    }),

    getCandiateExamPaperInfo: asyncHandler(async (req, res) => {
        console.log(req.query, '==req.query==');
        let { stud_roll, pub_test_id } = req.query;
        if (!stud_roll || !pub_test_id) throw new ApiError(400, 'Invalid details passed');

        let solvedPaper = await saveExamsController.getCandiateSolvedExamPaper(
            stud_roll,
            pub_test_id,
        );

        return res.status(200).json(new ApiResponse(200, solvedPaper, ''));
    }),

    getCandiateSolvedExamPaper: async (roll_no, ptid) => {
        let [_studentExamDetails] = await saveExamsModel.getStudentExamReportDetails({
            stud_roll: roll_no,
            pub_test_id: ptid,
        });

        let [_studQuestionPaper] = await saveExamsModel.getStudentQuestionPaper({
            stud_roll: roll_no,
            pub_test_id: ptid,
        });

        return { studExam: _studentExamDetails[0], quePaper: _studQuestionPaper };
    },
};
export default saveExamsController;
