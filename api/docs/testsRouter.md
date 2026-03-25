# testsRouter

## /details/:testId/:type
- **Method**: `GET`
- **Params**: `testId`, `type`
- **Return**: `{ "success": 1, "data": { "id": 1, "mt_name": "Final Exam", ... }, "message": null }`
- **Error**: `{ "success": 0, "message": "Test not found" }`

## /list
- **Method**: `GET`
- **Return**: `{ "success": 1, "data": [{ "id": 1, "mt_name": "Final Exam" }], "message": null }`
- **Error**: `{ "success": 0, "message": "Database error" }`

## /list-published
- **Method**: `GET`
- **Query**: `type`, `mode`
- **Return**: `{ "success": 1, "data": [{ "id": 5, "ptl_test_id": 1, "ptl_active_date": "2026-03-12" }], "message": null }`
- **Error**: `{ "success": 0, "message": "No published tests found" }`

## /create
- **Description**: Create new test.
- **Method**: `POST`
- **Body**: `test`, `testQuestions`
- **Return**: `{ "success": 1, "data": { "testDetails": { "id": 101 }, "message": "Successfully created test" }, "message": null }`
- **Error**: `{ "success": 0, "message": "Invalid test data" }`

## /v1/create-auto
- **Description**: Create new auto test.
- **Method**: `POST`
- **Body**: `test`, `topicList`
- **Return**: `{ "success": 1, "data": "Successfully created auto test", "message": null }`
- **Error**: `{ "success": 0, "message": "Insufficient questions for auto-generation" }`

## /v2/create-auto
- **Description**: Create new auto test.
- **Method**: `POST`
- **Body**: `test`, `topicList`
- **Return**: `{ "success": 1, "data": { "testDetails": { "id": 102 }, "message": "Successfully created auto test" }, "message": null }`
- **Error**: `{ "success": 0, "message": "Transaction failed" }`

## /delete
- **Method**: `DELETE`
- **Body**: `deleteId`
- **Return**: `{ "success": 1, "data": { "affectedRows": 1 }, "message": null }`
- **Error**: `{ "statusCode": 404, "message": "Invalid delete id passed" }`

## /check-for-duplicate-test-key
- **Description**: Check for duplicate test keys.
- **Method**: `POST`
- **Body**: `testKey`
- **Return**: `{ "_message": "Test key already exists", "_success": 2 }`
- **Error**: `{ "success": 0, "message": "No test key passed" }`

## /publish
- **Description**: Publish the exam.
- **Method**: `POST`
- **Body**: Test publication configuration
- **Return**: `{ "success": 1, "data": { "testDetails": { "id": 201 }, "message": "Successfully published test" }, "message": null }`
- **Error**: `{ "success": 0, "message": "Publish error" }`

## /unpublish
- **Method**: `DELETE`
- **Body**: `id`
- **Return**: `{ "success": 1, "data": { "message": "Successfully un-published test" }, "message": null }`
- **Error**: `{ "success": 0, "message": "Invalid test id" }`

## /questions
- **Description**: Getting test questions list.
- **Method**: `POST`
- **Body**: `testId`
- **Return**: `{ "success": 1, "data": [{ "q_id": 1, "q": "What is 2+2?" }], "message": null }`
- **Error**: `{ "success": 0, "message": "Failed to fetch questions" }`

## /update-test-question
- **Description**: Update test question.
- **Method**: `PUT`
- **Query**: `isMasterUpdate`
- **Body**: Updated question details
- **Return**: `{ "success": 1, "data": "Successfully updated question", "message": null }`
- **Error**: `{ "success": 0, "message": "Update failed" }`

## /create-mock
- **Description**: Mock exam.
- **Method**: `POST`
- **Body**: Mock test configuration
- **Return**: `{ "success": 1, "data": null, "message": "Successfully created mock test" }`
- **Error**: `{ "success": 0, "message": "Validation error" }`

## /upload-mock-report
- **Description**: Save mock report. This report will be pushed from exam panel.
- **Method**: `POST`
- **Body**: `studentsList`
- **Return**: `{ "success": 1, "data": "", "message": "Sucessfully saved mock exam report" }`
- **Error**: `{ "success": 0, "message": "Bulk create failed" }`

## /mock-test-report
- **Method**: `GET`
- **Query**: `ptid`
- **Return**: `{ "success": 1, "data": [{ "stl_stud_id": 1, "stl_test_status": "COMPLETED" }], "message": "" }`
- **Error**: `{ "success": 0, "message": "No mock report found" }`
