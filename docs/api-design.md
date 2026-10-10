QuickNotes API Design

1. Overview

QuickNotes is a note-taking application that allows users to create, view, update, delete, and organise notes using tags.

The API follows REST principles and uses JSON for request and response bodies. Endpoints use the /api/v1 prefix to support future versioning.

The current front-end demonstration uses JSONPlaceholder for practice. The endpoints documented below describe the proposed API for a complete QuickNotes backend.

2. API Endpoints

Method	Endpoint	Description	Success status
GET	/api/v1/notes	Retrieve the authenticated user’s notes	200 OK
POST	/api/v1/notes	Create a new note	201 Created
GET	/api/v1/notes/{noteId}	Retrieve one note by ID	200 OK
PATCH	/api/v1/notes/{noteId}	Update a note’s title or body	200 OK
DELETE	/api/v1/notes/{noteId}	Delete a note	204 No Content
GET	/api/v1/tags	Retrieve available tags	200 OK
POST	/api/v1/notes/{noteId}/tags	Add tags to a note	200 OK
GET	/api/v1/users/me	Retrieve the authenticated user’s profile	200 OK

Endpoint behaviour

* GET retrieves resources without changing them.
* POST creates a resource or performs an operation.
* PATCH updates selected fields of an existing resource.
* DELETE removes a resource.
* The API checks authentication and confirms that a user has permission to access the requested note.

3. Create a Note

Request

POST /api/v1/notes

Headers:

Content-Type: application/json

Authorization: Bearer <access_token>

Request body:

{
  "title": "Meeting notes",
  "body": "Discuss the project timeline.",
  "tagIds": [2]
}

The title is required and must contain no more than 100 characters. The body is optional.

Successful response — 201 Created

{
  "id": 101,
  "userId": 1,
  "title": "Meeting notes",
  "body": "Discuss the project timeline.",
  "createdAt": "2026-10-10T10:00:00Z",
  "updatedAt": "2026-10-10T10:00:00Z",
  "tags": [
    {
      "id": 2,
      "name": "Work"
    }
  ]
}

The server generates the note ID and timestamps. The response returns the newly created resource.

4. List Notes

Request

GET /api/v1/notes?limit=10&offset=0

The limit parameter specifies the maximum number of notes returned. The offset parameter specifies how many records to skip.

Successful response — 200 OK

{
  "data": [
    {
      "id": 101,
      "userId": 1,
      "title": "Meeting notes",
      "body": "Discuss the project timeline.",
      "createdAt": "2026-10-10T10:00:00Z",
      "updatedAt": "2026-10-10T10:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}

The API returns only notes belonging to the authenticated user. Pagination helps prevent large responses when a user has many notes.

5. Error Handling

The API uses standard HTTP status codes and returns a consistent JSON error structure.

Status	Error	Meaning
400	Bad Request	The request contains invalid data
401	Unauthorized	Authentication is missing or invalid
403	Forbidden	The user does not have permission to access the resource
404	Not Found	The requested resource does not exist
500	Internal Server Error	An unexpected server error occurred

Example error response

400 Bad Request

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required.",
    "details": {
      "title": "Required"
    }
  }
}

Error responses should provide useful messages without exposing passwords, access tokens, database credentials, or internal server details.

6. Authentication and Security

Protected endpoints require a valid bearer access token in the Authorization header.

The server must verify the token and check resource ownership before returning, updating, or deleting a note. Users must not be able to access another user’s private notes by changing a note ID.

Input validation must happen on the server even when the front end already validates the title. HTTPS should protect data while it travels between the client and server.

7. API Design Decisions

* REST conventions: HTTP methods clearly describe the operation being performed.
* JSON format: JSON is easy for JavaScript applications to send and receive.
* Versioning: The /api/v1 prefix allows future API changes without immediately breaking existing clients.
* Pagination: Limit and offset reduce response size and improve performance.
* Consistent errors: A shared error format makes failures easier for the front end to handle.
* Access control: Authentication and ownership checks help protect users’ private notes.

8. Current Demonstration Limitation

The QuickNotes front end currently uses JSONPlaceholder at https://jsonplaceholder.typicode.com/posts to practise GET, POST, and DELETE requests. JSONPlaceholder simulates write operations and does not permanently save created or deleted notes. A production version would connect to a real backend with persistent database storage, authentication, and authorisation.