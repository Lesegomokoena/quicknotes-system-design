# quicknotes-system-design
QuickNotes API client and system design capstone project
QuickNotes — System Design Capstone

Project Overview

QuickNotes is a simple note-taking web application built with HTML, CSS, and JavaScript. It demonstrates how a browser-based application communicates with a REST API and how a larger note-taking system could be designed to support one million registered users.

The application allows users to:

* Load and display notes from an API.
* Create notes with a required title and optional details.
* Delete notes.
* See loading, success, empty, and error messages.
* Receive validation feedback when a title is missing or exceeds 100 characters.

Technologies Used

* HTML5 — page structure and form elements.
* CSS3 — responsive styling and layout.
* JavaScript (ES6+) — event handling, validation, asynchronous requests, and rendering.
* Fetch API — HTTP communication.
* JSONPlaceholder — practice REST API for GET, POST, and DELETE requests.
* Git and GitHub — version control and project hosting.
* Markdown and SQL — API documentation and database design.

How to Run the Application

Requirements

* A modern web browser.
* Python 3, or another local static HTTP server.
* An internet connection to access JSONPlaceholder.

Steps

1. Clone or download this repository.
2. Open a terminal in the project folder.
3. Start a local web server:

python3 -m http.server 8000

4. Open the forwarded port 8000 in your browser. If running locally, visit http://localhost:8000.
5. Click Load notes to retrieve sample notes.
6. Enter a title and optional details, then click Create note.
7. Click Delete beneath a note to test deletion.

Keep the terminal running while using the application. Stop the server with Ctrl + C when you have finished.

Important API Limitation

The front end uses https://jsonplaceholder.typicode.com/posts. JSONPlaceholder simulates write operations, so newly created and deleted notes are not permanently stored on its server. Notes created in the demonstration are kept in the browser’s current application state and may disappear after reloading the page.

A production version would need a real backend, authentication, and persistent database storage.

Project Documentation

* API Design — REST endpoints, request and response examples, status codes, and security.
* Data Model — database tables, relationships, SQL statements, example queries, and indexing.
* System Architecture — system diagram, request flows, scalability estimates, trade-offs, and reliability.

Scalability Summary

The architecture document estimates the initial load for one million registered users using explicit planning assumptions:

* 100,000 daily active users.
* Approximately 58 average reads per second.
* Approximately 1.16 note creations per second.
* Approximately 73 GB of annual note storage growth under the stated note-size assumption.

These are estimates for capacity planning, not measured production traffic.

What I Learned

1. Working with REST APIs: I used asynchronous JavaScript and the Fetch API to load, create, and delete notes.
2. Handling errors and validation: I added input validation, loading indicators, success and error messages, and disabled buttons during requests.
3. Safe DOM manipulation: I used textContent to display user-provided note content rather than inserting it as HTML.
4. Database design: I designed relational tables, primary and foreign keys, relationships, indexes, and SQL JOIN queries.
5. System design and scalability: I explored load balancing, caching, read replicas, message queues, background workers, and single points of failure.
6. Version control: I used Git and GitHub to save and track project changes.

Future Improvements

* Build a backend API connected to a persistent database.
* Add user registration, authentication, and authorisation.
* Add note editing and search.
* Implement tags and filtering.
* Add automated tests and continuous integration.
* Add monitoring, backups, and production deployment.

Author

Created as a web development and system design capstone project.