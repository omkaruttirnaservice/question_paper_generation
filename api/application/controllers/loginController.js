import jwt from 'jsonwebtoken';
import authModel from '../model/authModel.js';
import { sendError, sendSuccess } from '../utils/commonFunctions.js';
import { getPool, dbStore } from '../config/db.connect.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const loginController = {
    login: async (req, res) => {
        console.log('login controller');
        try {
            const { username, password, dbConfig } = req.body;
            console.log(req.body, '=body');

            if (!username || !password || !dbConfig) {
                throw new Error('Username, password and Database are required');
            }

            const { poolPromise, sequelizeInstance } = await getPool(
                dbConfig.dbServerId,
                dbConfig.dbName,
            );
            if (!poolPromise) {
                throw new Error('Invalid Database Configuration');
            }

            let result;

            // Run authentication in the context of the selected DB
            await dbStore.run({ pool: poolPromise, sequelizeInstance }, async () => {
                [result] = await authModel.checkUserCredentials(username, password);
            });

            console.log(result, 'result================');

            if (!result || result.length === 0) {
                throw new Error('Invalid username or password');
            }

            const user = result[0];
            const token = jwt.sign(
                {
                    id: user.userId,
                    username: user.username,
                    role: user.role,
                    dbConfig,
                },
                JWT_SECRET,
                { expiresIn: '7d' },
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: false, // local dev
                sameSite: 'lax', // now works
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
                path: '/',
            });

            return sendSuccess(res, {
                id: user.userId,
                username: user.username,
                role: user.role,
                token,
            });
        } catch (error) {
            console.log(error, '=message================');
            return sendError(res, error?.message, error);
        }
    },
};

export default loginController;
