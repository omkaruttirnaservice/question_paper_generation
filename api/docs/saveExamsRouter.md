# saveExamsRouter

## /saveUploadedExam
- **Description**: This will save the answers given by the student in the exam and the students who have given exam. It will be called from the exam panel.
- **Method**: `POST`
- **Body**: `student_list` (Array), `pub_id` (Number), `exam_paper` (Array)
- **Return**: `{ "statusCode": 201, "data": {}, "message": "Successfully uploaded students and their question paper data" }`
- **Error**: `{ "statusCode": 204, "message": "No students list found" }` or `{ "statusCode": 424, "message": "Database error..." }`

## /single-candidate-paper
- **Method**: `GET`
- **Query**: `stud_roll`, `pub_test_id`
- **Return**: `{ "statusCode": 200, "data": { "studExam": { "sl_f_name": "...", "sl_l_name": "...", ... }, "quePaper": [{ "q_id": 1, ... }] }, "message": "" }`
- **Error**: `{ "statusCode": 400, "message": "Invalid details passed" }`
