import mysql from 'mysql2';
import dotenv from 'dotenv';
import { AsyncLocalStorage } from 'async_hooks';
import { databaseCredentialsMap } from '../../databaseCredentialsMap.js';
dotenv.config();

const __poolsMap = new Map();

import Sequelize from 'sequelize';
import { registerModels } from './modelLoader.js';

export async function getPool(dbId, dbName) {
    if (!dbId || !dbName) return undefined;

    if (!databaseCredentialsMap[dbId]) {
        throw new Error(`Unknown DB id: ${dbId}`);
    }

    const poolKey = `${dbId}:${dbName}`;
    if (__poolsMap.has(poolKey)) {
        const cached = __poolsMap.get(poolKey);
        return cached;
    }

    const cfg = databaseCredentialsMap[dbId];
    const pool = mysql.createPool({
        host: cfg.DB_HOST,
        user: cfg.DB_USER,
        password: cfg.DB_PASSWORD,
        database: dbName,
        port: cfg.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: cfg.connectionLimit ?? 10,
        queueLimit: 0,
    });

    // Create Sequelize instance for this specific DB
    const sequelizeInstance = new Sequelize(dbName, cfg.DB_USER, cfg.DB_PASSWORD, {
        host: cfg.DB_HOST,
        dialect: 'mysql',
        logging: console.log,
        define: {
            freezeTableName: true,
            charset: 'utf8mb4',
            dialectOptions: {
                collate: 'utf8mb4_0900_ai_ci',
            },
            timestamps: true,
        },
        timezone: '+05:30',
    });

    console.log('============Initializing SeqInstance Models=============');
    try {
        await sequelizeInstance.authenticate();
        console.log('Sequelize authenticate() success');

        // Register all models on this instance
        registerModels(sequelizeInstance);
        console.log('Models registered on dynamic instance');
    } catch (error) {
        console.log('Sequelize authenticate() or registration error');
        console.log(error, 'authenticate()=error');
    }

    const result = { pool, poolPromise: pool.promise(), sequelizeInstance };
    __poolsMap.set(poolKey, result);

    return result;
}

export const dbStore = new AsyncLocalStorage();
const dbProxy = new Proxy(
    {},
    {
        get(target, prop) {
            const store = dbStore.getStore();
            if (!store) {
                throw new Error(
                    'No database connection available. Please login to select a database.'
                );
            }

            const { pool, poolPromise, sequelizeInstance } = store;

            // 1. Check if looking for a Sequelize model by name
            if (sequelizeInstance && sequelizeInstance.models[prop]) {
                return sequelizeInstance.models[prop];
            }

            // 2. Try to get property from pool (mysql2)
            if (pool && prop in pool) {
                const value = Reflect.get(pool, prop);
                return typeof value === 'function' ? value.bind(pool) : value;
            }

            // if (poolPromise && prop in poolPromise) {
            //     const value = Reflect.get(poolPromise, prop);
            //     return typeof value === 'function' ? value.bind(poolPromise) : value;
            // }

            // 3. Fallback to sequelizeInstance methods
            if (sequelizeInstance && prop in sequelizeInstance) {
                const value = Reflect.get(sequelizeInstance, prop);
                return typeof value === 'function' ? value.bind(sequelizeInstance) : value;
            }

            return undefined;
        },
    }
);

export default dbProxy;
