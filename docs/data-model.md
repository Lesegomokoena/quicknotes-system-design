QuickNotes Data Model

1. Overview

QuickNotes uses a relational database to store users, notes, and tags. A relational database is suitable because the data has clear relationships and requires data integrity, reliable updates, and queries across related tables.

This design uses SQLite-compatible SQL. A production deployment could use PostgreSQL with the same core relationships.

2. Tables and Columns

Users

Stores account information for each QuickNotes user.

Column	Data type	Constraints	Description
id	INTEGER	Primary key	Unique user identifier
name	TEXT	NOT NULL	User’s display name
email	TEXT	UNIQUE, NOT NULL	User’s email address
password_hash	TEXT	NOT NULL	Secure password hash
created_at	DATETIME	NOT NULL	Account creation time

Passwords must be stored as secure hashes, never as plain text.

Notes

Stores the notes created by users.

Column	Data type	Constraints	Description
id	INTEGER	Primary key	Unique note identifier
user_id	INTEGER	Foreign key, NOT NULL	Owner of the note
title	VARCHAR(100)	NOT NULL	Note title, maximum 100 characters
body	TEXT	Nullable	Note content
created_at	DATETIME	NOT NULL	Note creation time
updated_at	DATETIME	NOT NULL	Last update time

Tags

Stores reusable labels for organising notes.

Column	Data type	Constraints	Description
id	INTEGER	Primary key	Unique tag identifier
name	TEXT	UNIQUE, NOT NULL	Tag name
created_at	DATETIME	NOT NULL	Tag creation time

Note_Tags

Connects notes to tags.

Column	Data type	Constraints	Description
note_id	INTEGER	Foreign key, primary key	Associated note
tag_id	INTEGER	Foreign key, primary key	Associated tag
created_at	DATETIME	NOT NULL	Time the tag was assigned

The combination of note_id and tag_id forms a composite primary key, preventing the same tag from being assigned to the same note more than once.

3. Relationships

* Users to Notes — one-to-many: One user can create many notes, but each note belongs to one user. The notes.user_id foreign key identifies the owner.
* Notes to Tags — many-to-many: A note can have several tags, and a tag can be used by many notes. The note_tags junction table connects them.
* Referential integrity: Foreign keys ensure that related records reference existing records. Deleting a note also removes its note-tag links.

4. SQL Table Creation

The following statements create the four tables.

PRAGMA foreign_keys = ON;
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL
        CHECK (length(trim(title)) BETWEEN 1 AND 100),
    body TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);
CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id)
        ON DELETE CASCADE
);

ON DELETE CASCADE automatically removes dependent records when their parent record is deleted. In SQLite, foreign-key enforcement must be enabled for the database connection.

5. Example SQL Queries

Query 1: Retrieve a user’s notes

This query retrieves the notes belonging to user ID 1, showing the most recently updated notes first.

SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC
LIMIT 10;

Query 2: Retrieve notes with their tags using JOIN

This query joins notes, the junction table, and tags to show each note with its assigned labels.

SELECT
    n.id AS note_id,
    n.title,
    t.name AS tag_name
FROM notes AS n
LEFT JOIN note_tags AS nt
    ON n.id = nt.note_id
LEFT JOIN tags AS t
    ON nt.tag_id = t.id
WHERE n.user_id = 1
ORDER BY n.id;

The LEFT JOIN keeps notes in the results even when they have no tags.

Query 3: Count notes per user

This query counts how many notes each user has created.

SELECT
    u.id AS user_id,
    u.name,
    COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n
    ON u.id = n.user_id
GROUP BY u.id, u.name
ORDER BY note_count DESC;

6. Indexing Strategy

CREATE INDEX idx_notes_user_updated
ON notes(user_id, updated_at DESC);

This index supports the common operation of retrieving one user’s notes ordered by the most recently updated. It can reduce the amount of data the database must scan and sort.

Indexes require extra storage and add overhead to inserts and updates, so they should be created for frequently used queries rather than every column.

7. SQL vs NoSQL

A relational SQL database is the preferred choice for QuickNotes because users, notes, and tags have structured relationships. Foreign keys and constraints help maintain data integrity, while transactions help ensure that related changes are completed consistently. SQL also supports JOIN operations for retrieving notes and their tags.

A NoSQL database can be useful when an application needs flexible document structures or particular large-scale distribution patterns. However, it may require additional application logic to maintain relationships. For this project, the structured data and relationship queries make SQL a sensible starting point.

8. Data Integrity and Security

* Validate note titles on both the client and server.
* Use parameterised SQL queries to help prevent SQL injection.
* Store only password hashes, using an appropriate password-hashing algorithm.
* Check that a user owns a note before reading, updating, or deleting it.
* Use database transactions when an operation changes multiple related records.
* Back up the database regularly and restrict access to sensitive information.