import dotenv from 'dotenv';
dotenv.config();
import express, { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import upload from 'express-fileupload';
import indexRoutes from './routes/indexRoutes.js';
import cors from 'cors';
import sequelize from './application/config/db-connect-migration.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.set('views', path.join(__dirname, 'application/views'));
app.set('view engine', 'pug');

// CORS setup with dynamic origin checking
app.use(
    cors({
        origin: function (origin, callback) {
            console.log(origin, 'Origin');
            // allow non-browser tools like Postman
            if (!origin || origin === 'null') return callback(null, true);

            const allowedOrigins = [
                'https://psa.atomtech.in',
                'kopbankasso',
                'sznsbal',
                'uttirna',
                'localhost',
                '192',
                '10',
            ];

            if (allowedOrigins.some((allowedOrigin) => origin.includes(allowedOrigin))) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

app.use(express.static('public'));

app.use(upload());

app.use(json({ limit: '1024mb' }));
app.use(urlencoded({ extended: true, limit: '1024mb' }));
app.use(cookieParser());

// sequelize
//     .authenticate()
//     .then()
//     .catch((err) => console.log(err, '==1=======database connection======================err=='));

app.get('/', (req, res) => {
    res.send('API is running....');
});

app.use('/api', indexRoutes);

import legacyRoutes from './routes/remoteRouterLegacy.js';
import { authenticateJWT } from './routes/authMiddleware.js';
app.use('/gov', authenticateJWT, legacyRoutes);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log('Server started on', process.env.PORT);
});
