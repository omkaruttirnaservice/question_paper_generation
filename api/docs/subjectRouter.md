# subjectRouter

## /list
- **Method**: `POST`
- **Body**: `post_id`
- **Return**: `{ "success": 1, "data": [{ "id": 1, "mtl_name": "Mathematics" }], "message": null }`
- **Error**: `{ "success": 0, "message": "Please send post id" }`

## /add
- **Method**: `POST`
- **Body**: `postId`, `subjectName`
- **Return**: `{ "success": 1, "data": "", "message": null }`
- **Error**: `{ "success": 0, "message": "Data not inserted" }`
