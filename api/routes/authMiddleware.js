import jwt from 'jsonwebtoken';
import { sendError } from '../application/utils/commonFunctions.js';
import { dbStore, getPool } from '../application/config/db.connect.js';
import ApiError from '../application/utils/ApiError.js';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateJWT = (req, res, next) => {
    try {
        const authHeader = req.cookies.token || req.headers.authorization;

        if (!authHeader) {
            console.log('2');
            return res.status(403).json({
                errMsg: 'Invalid token',
                satus: 403,
            });
        }

        const token = authHeader.replace('Bearer ', '');

        jwt.verify(token, JWT_SECRET, async (err, user) => {
            if (err) {
                return res.status(403).json({
                    errMsg: err?.message || 'Invalid token',
                    satus: 403,
                });
            }

            req.user = user;

            if (user.dbConfig) {
                try {
                    const { poolPromise, sequelizeInstance } = await getPool(
                        user.dbConfig.dbServerId,
                        user.dbConfig.dbName,
                    );

                    try {
                        await sequelizeInstance.authenticate();
                        console.log('Sequelize authenticate() success');
                    } catch (error) {
                        console.log('Sequelize authenticate() error');
                        console.log(error, 'authenticate()=error');
                    }

                    // console.log(sequelizeInstance,'sequelizeInstance============')
                    if (poolPromise) {
                        req.db = poolPromise;

                        // console.log(
                        //     `[authenticateJWT] Setting DB Context: ${user.dbConfig.dbName}`
                        // );

                        // Run next() within the context of the selected DB
                        dbStore.run({ pool: poolPromise, sequelizeInstance }, () => {
                            next();
                        });
                        return; // Ensure we don't call next() twice
                    } else {
                        console.error('Failed to get pool for', user.dbConfig);
                        // Optional: return error if DB is critical
                    }
                } catch (dbError) {
                    console.error('DB Connection Error:', dbError);
                    return res
                        .status(500)
                        .json(sendError(res, dbError, 'Database connection failed'));
                }
            }

            return res.status(403).json(sendError(res, err, 'Invalid token'));
        });
    } catch (error) {
        next(error);
    }
};
