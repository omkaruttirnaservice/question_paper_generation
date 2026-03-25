import { BIGINT, DATE, DATEONLY, Sequelize, JSON } from 'sequelize';
import sequelize from '../config/db-connect-migration.js';
import { test_question_sets_columns } from './tm_test_question_sets_mock.js';

const tm_test_question_sets = sequelize.define(
    'tm_test_question_sets',
    test_question_sets_columns,
    {
        timestamps: false,
    },
);

export default tm_test_question_sets;
