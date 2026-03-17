import { Router } from 'express';
import tm_student_test_list from '../application/schemas/tm_student_test_list.js';
import { asyncHandler } from '../application/utils/asyncHandler.js';

import puppeteer from 'puppeteer';
import saveExamsController from '../application/controllers/saveExamsController/saveExamsController.js';
import dbProxy from '../application/config/db.connect.js';
import archiver from 'archiver';

const browser = await puppeteer.launch();

const pdfRouter = Router();

pdfRouter.get(
    '/v1/candidate-response-sheet',
    asyncHandler(async (req, res) => {
        /**
         * Get the students roll no and publish test id
         * who are present for the exam
         */
        const examCandidateList = await dbProxy.tm_student_test_list.findAll({
            attributes: [
                ['stl_stud_id', 'roll_no'],
                ['stl_publish_id', 'ptid'],
            ],
            raw: true,
        });

        const totalCandidates = examCandidateList.length;
        console.log(`Generating ${totalCandidates} response sheets`);

        for (let i = 0; i < examCandidateList.length; i++) {
            let { roll_no, ptid } = examCandidateList[i];
            console.log(
                `Generating  ${i + 1} / ${totalCandidates} | ${(((i + 1) * 100) / totalCandidates).toFixed(2)} %`,
            );

            // open a new page
            const page = await browser.newPage();

            let solvedPaper = await saveExamsController.getCandiateSolvedExamPaper(roll_no, ptid);

            const html = await renderPagePromise(res, 'candidate-solved-paper', solvedPaper);

            await page.setContent(html);

            // create pdf
            await page.pdf({
                path: `pdf/${roll_no}.pdf`,
                format: 'A4',
                printBackground: true,
            });

            await page.close();
        }
    }),
);

pdfRouter.get(
    '/v3/candidate-response-sheet',
    asyncHandler(async (req, res) => {
        /**
         * Get the students roll no and publish test id
         * who are present for the exam
         * this will download the file in zip format
         */
        const examCandidateList = await dbProxy.tm_student_test_list.findAll({
            attributes: [
                ['stl_stud_id', 'roll_no'],
                ['stl_publish_id', 'ptid'],
            ],
            raw: true,
        });

        const archive = archiver('zip');
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename=responsesheet.zip',
        });
        res.flushHeaders();

        archive.on('error', (err) => {
            console.error(err);
            res.status(500).end();
        });

        archive.pipe(res);

        const totalCandidates = examCandidateList.length;
        console.log(`Generating ${totalCandidates} response sheets`);

        for (let i = 0; i < examCandidateList.length; i++) {
            let { roll_no, ptid } = examCandidateList[i];
            console.log(
                `Generating  ${i + 1} / ${totalCandidates} | ${(((i + 1) * 100) / totalCandidates).toFixed(2)} %`,
            );

            // open a new page
            const page = await browser.newPage();

            let solvedPaper = await saveExamsController.getCandiateSolvedExamPaper(roll_no, ptid);

            const html = await renderPagePromise(res, 'candidate-solved-paper', solvedPaper);

            await page.setContent(html);

            // create pdf
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
            });

            await page.close();

            archive.append(Buffer.from(pdfBuffer), { name: `${roll_no}.pdf` });
        }
        await archive.finalize();
    }),
);

pdfRouter.get(
    '/v2/candidate-response-sheet',
    asyncHandler(async (req, res) => {
        /**
         * V2:
         * This will process pdf creation in batch
         */
        /**
         * Get the students roll no and publish test id
         * who are present for the exam
         */
        const examCandidateList = await tm_student_test_list.findAll({
            attributes: [
                ['stl_stud_id', 'roll_no'],
                ['stl_publish_id', 'ptid'],
            ],
            raw: true,
        });

        if (examCandidateList.length == 0) {
            console.log('No candidates found');
            return;
        }

        let batchSize = 3;
        let totalBatches = Math.ceil(examCandidateList.length / batchSize);

        for (let i = 0; i < totalBatches; i++) {
            let start = i * batchSize;
            let end = Math.min(start + batchSize, examCandidateList.length);
            let currentBatch = examCandidateList.slice(start, end);

            await Promise.all(
                currentBatch.map(async ({ roll_no, ptid }) => {
                    try {
                        console.log('Generating:', roll_no, ptid);

                        // open a new page
                        const page = await browser.newPage();

                        let solvedPaper = await saveExamsController.getCandiateSolvedExamPaper(
                            roll_no,
                            ptid,
                        );

                        const html = await renderPagePromise(
                            res,
                            'candidate-solved-paper',
                            solvedPaper,
                        );

                        await page.setContent(html, {
                            waitUntil: 'networkidle0',
                        });

                        // create pdf
                        await page.pdf({
                            path: `pdf/response_sheet_${roll_no}_${ptid}.pdf`,
                            format: 'A4',
                            printBackground: true,
                        });

                        await page.close();
                    } catch (error) {
                        console.log(`Failed to generate pdf for: ${roll_no}`);
                    }
                }),
            );
        }
    }),
);

function renderPagePromise(res, view, data = {}) {
    return new Promise((resolve, reject) => {
        res.render(view, data, (err, html) => {
            if (err) reject(err);
            resolve(html);
        });
    });
}

export default pdfRouter;
