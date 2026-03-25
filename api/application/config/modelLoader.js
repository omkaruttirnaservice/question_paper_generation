import aouth from '../schemas/aouth.js';
import mock_exam_report from '../schemas/mock_exam_report.js';
import tm_exam_to_question from '../schemas/tm_exam_to_question.js';
import tm_main_topic_list from '../schemas/tm_main_topic_list.js';
import tm_master_test_list from '../schemas/tm_master_test_list.js';
import tm_mega_question_set from '../schemas/tm_mega_question_set.js';
import tm_publish_test_by_post from '../schemas/tm_publish_test_by_post.js';
import tm_publish_test_list from '../schemas/tm_publish_test_list.js';
import tm_server_ip_list from '../schemas/tm_server_ip_list.js';
import tm_student_final_result_set from '../schemas/tm_student_final_result_set.js';
import tm_student_question_paper from '../schemas/tm_student_question_paper.js';
import tm_student_test_list from '../schemas/tm_student_test_list.js';
import tm_sub_topic_list from '../schemas/tm_sub_topic_list.js';
import tm_test_question_sets from '../schemas/tm_test_question_sets.js';
import tm_test_question_sets_mock from '../schemas/tm_test_question_sets_mock.js';
import tm_test_user_master_list from '../schemas/tm_test_user_master_list.js';
import tn_center_list from '../schemas/tn_center_list.js';
import tn_student_list from '../schemas/tn_student_list.js';
import tn_student_list_mock from '../schemas/tn_student_list_mock.js';

const models = [
    aouth,
    mock_exam_report,
    tm_exam_to_question,
    tm_main_topic_list,
    tm_master_test_list,
    tm_mega_question_set,
    tm_publish_test_by_post,
    tm_publish_test_list,
    tm_server_ip_list,
    tm_student_final_result_set,
    tm_student_question_paper,
    tm_student_test_list,
    tm_sub_topic_list,
    tm_test_question_sets,
    tm_test_question_sets_mock,
    tm_test_user_master_list,
    tn_center_list,
    tn_student_list,
    tn_student_list_mock,
];

export const registerModels = async (sequelizeInstance) => {
    models.forEach((model) => {
        // Define the model on the new instance using the metadata from the static model
        sequelizeInstance.define(model.name, model.rawAttributes, {
            ...model.options,
            sequelize: sequelizeInstance, // Explicitly bind to new instance
        });
    });
};
