# studentsAreaRouter

## /get-server-ip
- **Method**: `GET`
- **Return**: `{ "statusCode": 200, "data": [{ "id": 1, "form_filling_server_ip": "...", "exam_panel_server_ip": "..." }], "message": "Success" }`
- **Error**: `{ "statusCode": 404, "data": [], "message": "No ip found." }`

## /set-server-ip
- **Method**: `POST`
- **Body**: `form_filling_server_ip`, `exam_panel_server_ip`
- **Return**: `{ "statusCode": 201, "data": null, "message": "Successfully added new ip." }`
- **Error**: `{ "statusCode": 404, "message": "Invalid IP address..." }`

## /update-server-ip
- **Method**: `PUT`
- **Body**: `form_filling_server_ip`, `exam_panel_server_ip`, `id`
- **Return**: `{ "statusCode": 201, "data": null, "message": "Successfully updated new ip." }`
- **Error**: `{ "statusCode": 404, "message": "Invalid edit ID" }`

## /delete-server-ip/:id
- **Method**: `DELETE`
- **Params**: `id`
- **Return**: `{ "statusCode": 200, "data": null, "message": "Successfully deleted IP." }`
- **Error**: `{ "statusCode": 400, "message": "Invalid delete id." }`

## /all-list
- **Description**: This is to get list from form filling server.
- **Method**: `POST`
- **Body**: `ip`
- **Return**: `{ "statusCode": 200, "data": "", "message": "Students list" }`
- **Error**: `{ "statusCode": 404, "message": "Invalid IP address" }`

## /v3/all-list
- **Description**: This is to get list from form filling server.
- **Method**: `POST`
- **Body**: `ip`
- **Return**: `{ "statusCode": 200, "data": "", "message": "Students list" }`
- **Error**: `{ "statusCode": 400, "message": "Students list empty." }`

## /all-list (Local)
- **Description**: This is to get list from local server.
- **Method**: `GET`
- **Return**: `{ "statusCode": 200, "data": [...student objects], "message": "Students list" }`
- **Error**: `{ "statusCode": 500, "message": "Error message" }`

## /v2/all-list (Paginated)
- **Description**: This is to get list from local server.
- **Method**: `GET`
- **Query**: `limit`, `page`
- **Return**: `{ "statusCode": 200, "data": { "rows": [...], "count": 100 }, "message": "Students list" }`
- **Error**: `{ "statusCode": 500, "message": "Error message" }`

## /v1/student-search-page-filter
- **Description**: This is to get list from local server.
- **Method**: `GET`
- **Return**: `{ "statusCode": 200, "data": { "_centersList": [...], "_batchList": [...], ... }, "message": "Students list page filters" }`
- **Error**: `{ "statusCode": 500, "message": "Error message" }`

## /all-list-filtered
- **Description**: This is to get filtered list from local server.
- **Method**: `POST`
- **Body**: `centerNumber`, `batchNumber`, `date`, `postName`
- **Return**: `{ "statusCode": 200, "data": [...], "message": "Students list" }`
- **Error**: `{ "statusCode": 400, "message": "Invalid data" }`

## /download-centers-list
- **Description**: Get centers list.
- **Method**: `POST`
- **Body**: `ip`
- **Return**: `{ "statusCode": 200, "data": { "id": 1, ... }, "message": "Centers list downloaded successfully" }`
- **Error**: `{ "statusCode": 400, "message": "No center / college list found." }`

## /centers-list
- **Method**: `GET`
- **Return**: `{ "statusCode": 200, "data": { "_centersList": [...], "_batchList": [...] }, "message": "Centers list and batch list" }`
- **Error**: `{ "statusCode": 500, "message": "Error message" }`

## /get-students-question-paper
- **Description**: Downlaod student question paper from exam server.
- **Method**: `POST`
- **Body**: `exam_panel_server_ip`
- **Return**: `{ "statusCode": 200, "data": null, "message": "Successfully downlaoded student question paper." }`
- **Error**: `{ "statusCode": 400, "message": "No student question paper found." }`

## /upload-published-test-to-form-filling
- **Description**: Upload published test and question paper to form fililng panel.
- **Method**: `POST`
- **Body**: `published_test_id`, `ip_details`
- **Return**: `{ "statusCode": 200, "data": null, "message": "Successfully uploaded published test and question paper..." }`
- **Error**: `{ "statusCode": 400, "message": "Invalid published test id." }`

## /upload-present-studetns-to-form-filling
- **Method**: `POST`
- **Body**: `published_test_id`, `ip_details`
- **Return**: `{ "statusCode": 200, "data": null, "message": "Successfully marked present students Count: ..." }`
- **Error**: `{ "statusCode": 404, "message": "No result found for the student" }`
