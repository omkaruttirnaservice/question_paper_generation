import { parentPort, workerData } from 'worker_threads';
import excel from 'exceljs';

(async () => {
    const data = workerData;

    let workbook = new excel.Workbook();
    let workSheet = workbook.addWorksheet('Sheet_1');

    // prettier-ignore
    const headerColumns = [ '#', 'Roll No', 'Post', 'First Name', 'Middle Name', 'Last Name', 'Date Of Birth', 'Category', 'Gender', 'Mobile', 'Attempted', 'Uttempted', 'Correct', 'Score']

    workSheet.addRow(headerColumns);

    data._resultDetailsRes.forEach((el, idx) => {
        workSheet.addRow([
            idx + 1,
            el.id,
            el.sl_post,
            el.sl_f_name,
            el.sl_m_name,
            el.sl_l_name,
            el.dob,
            el.sl_catagory,
            el.sl_gender,
            el.sl_contact_number,
            parseInt(el.sfrs_correct) + parseInt(el.sfrs_wrong),
            el?.sfrs_unattempted || 0,
            el?.sfrs_correct || 0,
            data.resultType === 'PERCENTILE'
                ? el?.srfs_percentile
                : `${el?.sfrs_marks_gain} / ${el?.sfrc_total_marks}`,
        ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    parentPort.postMessage(buffer);
})();
