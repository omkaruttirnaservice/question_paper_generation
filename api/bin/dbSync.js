import sequelize from '../application/config/db-connect-migration.js';

import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';

const createDatabaseIfNotExists = async () => {
    try {
        // Create a new Sequelize instance without specifying a database
        const { DB_NAME, DB_USER, DB_PASSWORD, HOST, DB_PORT } = process.env;
        console.log(DB_NAME, DB_USER, DB_PASSWORD, HOST, DB_PORT);
        const tempSequelize = new Sequelize({
            host: HOST,
            username: DB_USER,
            password: DB_PASSWORD,
            port: DB_PORT,
            dialect: 'mysql',
        });
        console.log(`Creating database if not exsists: ${DB_NAME}`);

        // create database if not exists
        await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);

        await tempSequelize.close(); // Close the temporary connection
    } catch (error) {
        console.error('❌ Error while checking/creating database:', error);
        process.exit(1);
    }
};

class RequireModels {
    models = {};
    constructor() {}

    async require(directoryPath) {
        const files = fs.readdirSync(directoryPath).filter((file) => file.endsWith('.js'));
        for (let file of files) {
            let model = await import(path.join(directoryPath, file));
            console.log(`Importing: ${model.default.name}`);
            this.models[model.default.name] = model.default;
        }

        return this.models;
    }
}

const getSync = () => {
    sequelize
        .sync({ alter: true })
        .then(() => {
            console.log(
                '"\x1b[47m", \x1b[30m%s\x1b[0m',
                'Database has been migrated successfully, you can now start the server.',
            );
        })
        .catch((error) => {
            console.log(error);
            process.exit(1);
        });
};

await createDatabaseIfNotExists();

const SCHEMAS_PATH = path.join(process.cwd(), 'application', 'schemas');
let models = await new RequireModels().require(SCHEMAS_PATH);

getSync();
