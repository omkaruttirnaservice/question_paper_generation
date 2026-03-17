import jwt from 'jsonwebtoken';
import { dbStore, getPool } from '../application/config/db.connect.js';
const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateJWT = (req, res, next) => {
    try {
        const authHeader = req.cookies.token || req.headers.authorization;

        if (!authHeader) {
            return res.status(403).json({
                errMsg: 'Invalid token',
                status: 403,
            });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(403).json({
                errMsg: 'Invalid token',
                status: 403,
            });
        }

        jwt.verify(token, JWT_SECRET, async (err, user) => {
            if (err) {
                return res.status(403).json({
                    errMsg: err?.message || 'Invalid token',
                    status: 403,
                });
            }

            req.user = user;

            if (!user.dbConfig) {
                return res.status(400).json({
                    errMsg: 'No database configuration found in token',
                    status: 400,
                });
            }

            // get the pool connection for the database specified in the token
            const { poolPromise, sequelizeInstance } = await getPool(
                user.dbConfig.dbServerId,
                user.dbConfig.dbName,
            );

            console.log('Auth sequelize instance...');
            await sequelizeInstance.authenticate();
            console.log('Sequelize authenticate() success');

            if (!poolPromise) {
                console.error('Failed to get pool for', user.dbConfig);
            }
            req.db = poolPromise;

            // Run next() within the context of the selected DB
            dbStore.run({ pool: poolPromise, sequelizeInstance }, () => {
                next();
            });
        });
    } catch (error) {
        console.log('Error in auth middleware:');
        console.log(error);
        next(error);
    }
};
