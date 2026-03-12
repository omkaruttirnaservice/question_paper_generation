# topicRouter

## /list
- **Method**: `POST`
- **Body**: `subjectId`
- **Return**: `{ "success": 1, "data": [{ "id": 1, "topic_name": "Calculus" }], "message": null }`
- **Error**: `{ "success": 0, "message": "Error details..." }`

## /get-topic-list-and-question-count
- **Method**: `POST`
- **Body**: `subjectId`
- **Return**: `{ "success": 1, "data": [{ "id": 1, "topic_name": "Calculus", "subject_id": 10, "question_count": 50 }], "message": null }`
- **Error**: `{ "success": 0, "message": "Error details..." }`

## /add-topic
- **Method**: `POST`
- **Body**: `postId`, `subjectId`, `topicName`
- **Return**: `{ "success": 1, "data": { "fieldCount": 0, "affectedRows": 1, ... }, "message": null }`
- **Error**: `{ "success": 0, "message": "Error details..." }`
