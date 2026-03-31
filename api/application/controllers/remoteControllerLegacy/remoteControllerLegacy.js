import { Sequelize } from 'sequelize';
import sequelize from '../../config/db-connect-migration.js';
import remoteModelLegacy from '../../model/remoteModelLegacy.js';
// import tm_publish_test_by_post from '../../schemas/tm_publish_test_by_post.js';
// import tm_publish_test_list from '../../schemas/tm_publish_test_list.js';
// import tm_student_question_paper from '../../schemas/tm_student_question_paper.js';
// import tm_student_test_list from '../../schemas/tm_student_test_list.js';
// import tm_test_question_sets from '../../schemas/tm_test_question_sets.js';
// import tn_center_list from '../../schemas/tn_center_list.js';
// import tn_student_list from '../../schemas/tn_student_list.js';
import ApiError from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

import db from '../../config/db.connect.js';

const remoteControllerLegacy = {
    getTodaysExamList: asyncHandler(async (req, res) => {
        /**
         * This API used to get todays exam list
         * Exam panel will send which exams id it has already downloaded
         * And it will return the list of exams which are not downloaded yet
         * eg req.body
         * {
         *     exam_list: { exam_list: [ 1, 2, 3 ] }
         * }
         */

        try {
            const data = req.body;
            let _examsList = await remoteModelLegacy.getTodaysExamList(data);

            if (_examsList.length == 0)
                return res.status(400).json({
                    call: 0,
                    data: {},
                });

            return res.status(200).json({
                call: 1,
                data: _examsList,
            });
        } catch (error) {
            console.log(error, '==error==');
        }
    }),

    getNewExamListV2: asyncHandler(async (req, res) => {
        /**
         * This API used to get exam list based on the date provided
         * Exam panel will send which exams id it has already downloaded
         * And also the exam date for which it wants the exam list
         * eg req.body
         * {
         *     { exam_list: { exam_list: [ 9, 10, 11 ], examDate: '2025-11-06', examMode: 'EXAM' | 'MOCK' } }
         * }
         */

        try {
            const data = req.body;
            let [_examsList] = await remoteModelLegacy.getExamListV2(data);

            if (_examsList.length == 0)
                return res.status(404).json({
                    call: 0,
                    message: 'No exams found',
                    data: {},
                });

            return res.status(200).json({
                call: 1,
                data: _examsList,
            });
        } catch (error) {
            console.log(error, '==error==');
        }
    }),

    downloadExam: asyncHandler(async (req, res) => {
        try {
            /**
             * This API used to download all exam details for the given published test id
             * Will download exam_info & its post name and published test id mapping, question_paper
             * This will also alter column names (eg. give alias to column to match in old exam panel)
             * eg req.params
             * {
             *     ptId: 8  // published test id (will come in req.params)
             * } *
             */

            const { ptId } = req.params;
            if (!ptId) throw new ApiError(400, 'Exam id required');

            // gettting test information
            const exam_info = await db.tm_publish_test_list.findAll({
                attributes: [
                    ['id', 'id'],
                    ['ptl_active_date', 'ptl_active_date'],
                    ['ptl_time', 'ptl_time'],
                    ['ptl_link', 'ptl_link'],
                    ['ptl_link_1', 'ptl_link_1'],
                    ['ptl_test_id', 'ptl_test_id'],
                    ['ptl_master_exam_id', 'ptl_master_exam_id'],
                    ['ptl_master_exam_name', 'ptl_master_exam_name'],
                    ['ptl_added_date', 'ptl_added_date'],
                    ['ptl_added_time', 'ptl_added_time'],
                    ['ptl_time_stamp', 'ptl_time_tramp'],
                    ['ptl_test_description', 'ptl_test_description'],
                    ['ptl_is_live', 'ptl_is_live'],
                    ['ptl_aouth_id', 'ptl_aouth_id'],
                    ['ptl_is_test_done', 'ptl_is_test_done'],
                    ['ptl_test_info', 'ptl_test_info'],
                    ['mt_name', 'mt_name'],
                    ['mt_added_date', 'mt_added_date'],
                    ['mt_descp', 'mt_descp'],
                    ['mt_is_live', 'mt_is_live'],
                    ['mt_time_stamp', 'mt_time_stamp'],
                    ['mt_type', 'mt_type'],
                    ['tm_aouth_id', 'tm_aouth_id'],
                    ['mt_test_time', 'mt_test_time'],
                    ['mt_total_test_takan', 'mt_total_test_takan'],
                    ['mt_is_negative', 'mt_is_negative'],
                    ['mt_negativ_mark', 'mt_negativ_mark'],
                    ['mt_mark_per_question', 'mt_mark_per_question'],
                    ['mt_passing_out_of', 'mt_passing_out_of'],
                    ['mt_total_marks', 'mt_total_marks'],
                    ['mt_pattern_type', 'mt_pattern_type'],
                    ['mt_total_test_question', 'mt_total_test_question'],
                    ['mt_added_time', 'mt_added_time'],
                    ['mt_pattern_name', 'mt_pattern_name'],
                    ['is_test_generated', 'is_test_generated'],
                    [Sequelize.literal('IF(ptl_test_mode="EXAM",1,0)'), 'ptl_test_mode'],
                    ['tm_allow_to', 'tm_allow_to'],
                    ['is_test_loaded', 'is_test_loaded'],
                    ['is_student_added', 'is_student_added'],
                    ['is_uploaded', 'is_uploaded'],
                    ['is_start_exam', 'is_start_exam'],
                    ['is_absent_mark', 'is_absent_mark'],
                    ['is_exam_downloaded', 'is_exam_downloaded'],
                    ['is_photos_downloaded', 'is_photos_downloaded'],
                    ['is_sign_downloaded', 'is_sign_downloaded'],
                    ['is_final_published', 'is_final_published'],
                    ['is_students_downloaded', 'is_students_downloaded'],
                    ['is_attendance_started', 'is_attendance_started'],
                    ['center_code', 'center_code'],
                    ['is_show_exam_sections', 'is_show_exam_sections'],
                    ['is_show_mark_for_review', 'is_show_mark_for_review'],
                    ['is_show_clear_response', 'is_show_clear_response'],
                    ['end_button_time', 'end_button_time'],
                ],
                where: {
                    id: Number(ptId),
                },
                raw: true,
            });

            if (exam_info.length == 0) {
                return res.status(404).json({
                    call: 2,
                    message: 'No exam found with the given id',
                });
            }

            const _examInfo = exam_info[0];
            console.log(_examInfo, '_examInfo');
            /**
             * Adding ptl_test_info
             * This is to match the old exam panel structure
             * Cause In old exam panel ptl_test_info is used to hold exam details
             * In newer exam panel we have removed this and just kept empty object, cause all info have been stored in DB columns properly
             */
            exam_info[0].ptl_test_info = JSON.stringify([
                {
                    test_id: '2',
                    test_name: _examInfo.mt_name,
                    test_created_on: _examInfo.ptl_added_date,
                    test_descp: '-',
                    test_type: 'Online',
                    test_duration: _examInfo.mt_test_time,
                    test_negative: _examInfo.mt_negativ_mark,
                    test_mark_per_q: _examInfo.mt_mark_per_question,
                    passing_out_of: _examInfo.mt_passing_out_of,
                    test_total_marks: _examInfo.mt_total_marks,
                    test_pattern: _examInfo.mt_pattern_type,
                    test_total_question: _examInfo.mt_total_test_question,
                    id: _examInfo.ptl_test_id,
                    mt_name: _examInfo.mt_name,
                    mt_added_date: _examInfo.ptl_added_date,
                    mt_descp: _examInfo.ptl_test_description,
                    mt_added_time: _examInfo.ptl_added_time,
                    mt_is_live: _examInfo.mt_is_live,
                    mt_time_stamp: _examInfo.mt_time_stamp,
                    mt_type: _examInfo.mt_type,
                    tm_aouth_id: _examInfo.tm_aouth_id,
                    mt_test_time: _examInfo.mt_test_time,
                    mt_total_test_takan: _examInfo.mt_total_test_takan,
                    mt_is_negative: _examInfo.mt_is_negative,
                    mt_negativ_mark: _examInfo.mt_negativ_mark,
                    mt_mark_per_question: _examInfo.mt_mark_per_question,
                    mt_passing_out_of: _examInfo.mt_passing_out_of,
                    mt_total_marks: _examInfo.mt_total_marks,
                    mt_pattern_type: _examInfo.mt_pattern_type,
                    mt_total_test_question: _examInfo.mt_total_test_question,
                },
            ]);

            const ptl_test_id = exam_info[0].ptl_test_id;

            // get post list for the published test
            const _postsList = await db.tm_publish_test_by_post.findAll({
                where: {
                    published_test_id: ptId,
                },
                raw: true,
            });

            let question_paper = [];
            // getting question paper
            if (_examInfo.ptl_test_mode === 0) {
                // We are getting mock question only
                // because ptl_test_mode = 0
                console.log(`Getting mock question paper`);

                question_paper = await db.tm_test_question_sets_mock.findAll({
                    where: {
                        tqs_test_id: ptl_test_id,
                    },
                    raw: true,
                });
            } else {
                // We are getting exam question only
                // because ptl_test_mode = 1
                console.log(`Getting exam question paper`);
                question_paper = await db.tm_test_question_sets.findAll({
                    where: {
                        tqs_test_id: ptl_test_id,
                    },
                    raw: true,
                });
            }

            if (question_paper.length == 0) {
                return res.status(404).json({
                    call: 3,
                    message: 'Question paper not found',
                });
            }

            // if test mode is mock then also send students
            let _mockStudentsList = null;
            if (_examInfo.ptl_test_mode === 0) {
                _mockStudentsList = await db.tn_student_list_mock.findAll({
                    where: {
                        sl_batch_no: _examInfo.tm_allow_to,
                        sl_date: _examInfo.ptl_active_date,
                    },
                    raw: true,
                });
            }

            return res.status(200).json({
                call: 1,
                exam_info: exam_info,
                exam_question: question_paper,
                _postsList: _postsList,
                _mockStudentsList: _mockStudentsList ?? [],
            });
        } catch (error) {
            console.log(error);
        }
    }),

    downloadStudent: asyncHandler(async (req, res) => {
        /** *
         * Download student list for the given center code and batch
         * First we need to download all student list from form filling panel (its located in new QPGeneration panel => student area > Add new student)
         *
         * Then this api will be used to download students list in exam panel
         * AS per params
         * eg req.params
         * {
         *  cc: '101', // center code
         *  batch: '1' // batch number
         * }
         */

        const { cc, batch } = req.params;
        const _studentsList = await db.tn_student_list.findAll({
            where: {
                sl_center_code: cc,
                sl_batch_no: batch,
            },
            raw: true,
        });

        if (_studentsList.length == 0) {
            return res.status(200).json({
                call: 2,
                message: 'No students found for the given center code and batch',
            });
        }

        return res.status(200).json({
            call: 1,
            exam_student_list: _studentsList,
        });
    }),

    saveExamData: asyncHandler(async (req, res) => {
        console.log(req.body, '==req.body==');
        let { student_list, pub_id, exam_paper } = req.body;

        if (student_list.length == 0) throw new ApiError(204, 'No students list found');

        if (exam_paper.length == 0) throw new ApiError(204, 'No exams list found');

        if (!pub_id) throw new ApiError(204, 'Invalid publish id');

        try {
            await db.tm_student_test_list.bulkCreate(student_list);
            await db.tm_student_question_paper.bulkCreate(exam_paper);

            return res.status(200).json({
                call: 1,
                message: 'Successfully saved students and their question paper data',
            });
        } catch (error) {
            console.log(error, '==error==');
            throw new ApiError(424, error?.message || 'Something went wrong on server');
        }
    }),

    //    saveExamData: asyncHandler(async (req, res) => {
    //     console.log(req.body, '==req.body==');
    //     let { student_list, pub_id, exam_paper } = req.body;

    //     if (student_list.length == 0) throw new ApiError(204, 'No students list found');

    //     if (exam_paper.length == 0) throw new ApiError(204, 'No exams list found');

    //     if (!pub_id) throw new ApiError(204, 'Invalid publish id');

    //     let transact = await sequelize.transaction();

    //     try {
    //         console.log(db, 'db details');
    //         await db.tm_student_test_list.bulkCreate(student_list, {
    //             transaction: transact,
    //         });
    //         await db.tm_student_question_paper.bulkCreate(exam_paper, {
    //             transaction: transact,
    //         });
    //         await transact.commit();

    //         return res.status(200).json({
    //             call: 1,
    //             message: 'Successfully saved students and their question paper data',
    //         });
    //         // return res
    //         //     .status(201)
    //         //     .json(
    //         //         new ApiResponse(
    //         //             201,
    //         //             {},
    //         //             'Successfully uploaded students and their question paper data'
    //         //         )
    //         //     );
    //     } catch (error) {
    //         console.log(error, '==error==');
    //         await transact.rollback();
    //         throw new ApiError(424, error?.message || 'Something went wrong on server');
    //     }
    // }),

    getCenterData: asyncHandler(async (req, res) => {
        const centerCode = req.params.centerCode;
        console.log(centerCode, 'centerCode');

        const centerDetails = await db.tn_center_list.findOne({
            where: {
                cl_number: centerCode,
            },
            attributes: [
                ['id', 'id'],
                ['cl_user_name', 'a_master_name'],
                ['cl_password', 'a_master_password'],
                ['cl_number', 'a_code'],
                ['cl_number', 'a_app_code'],
                ['cl_name', 'a_center_name'],
                ['cl_address', 'a_center_address'],
            ],
            raw: true,
        });
        console.log(centerDetails);
        res.status(200).json({
            call: 1,
            data: [centerDetails],
        });
        // return
        if (!centerDetails) {
            return res.status(200).json({
                call: 0,
                message: 'Center details not found',
            });
        }
    }),
};
export default remoteControllerLegacy;
