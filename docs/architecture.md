QuickNotes System Architecture

1. Overview

QuickNotes is a note-taking application that allows users to create, view, update, delete, and organise notes. The system uses a web client, an API service, a relational database, a cache, and background workers.

The proposed architecture is designed to handle increasing traffic while keeping the application responsive, reliable, and secure.

2. Functional Requirements

The system must:

1. Allow users to register and authenticate securely.
2. Allow authenticated users to create, view, update, and delete their notes.
3. Validate note titles and other input before saving.
4. Allow users to organise notes with tags.
5. Return notes in pages rather than sending all records at once.
6. Display loading, success, empty, and error states in the client.
7. Prevent users from accessing notes owned by other users.

3. Non-Functional Requirements

* Performance: Common note-list requests should respond quickly under normal load.
* Scalability: The application should scale horizontally by adding application servers.
* Availability: A single application-server failure should not make the entire service unavailable.
* Security: Use HTTPS, secure authentication, server-side validation, and access controls.
* Reliability: Back up persistent data and monitor failures.
* Maintainability: Keep the front end, API, database, and background processing responsibilities separate.
* Consistency: Store notes in a persistent database and handle concurrent updates carefully.

4. High-Level Architecture Diagram

flowchart TD
    U[User / Web Browser] --> DNS[DNS]
    DNS --> CDN[CDN]
    CDN --> LB[Load Balancer]
    LB --> A1[Application Server 1]
    LB --> A2[Application Server 2]
    A1 --> C[Distributed Cache]
    A2 --> C
    C --> DB[(Primary Database)]
    DB --> RR[(Read Replica)]
    A1 --> Q[Message Queue]
    A2 --> Q
    Q --> W[Background Worker]
    W --> DB
    A1 --> M[Monitoring and Logs]
    A2 --> M
    W --> M

5. Component Responsibilities

* Web client: Displays the user interface, validates basic input, and sends API requests.
* DNS: Resolves the application’s domain name to the appropriate network destination.
* CDN: Caches static assets such as CSS, JavaScript, and images closer to users, reducing latency and load on the origin.
* Load balancer: Distributes incoming requests across healthy application servers and performs health checks.
* Application servers: Run API logic, validate requests, authenticate users, enforce permissions, and communicate with data services.
* Distributed cache: Stores frequently requested data temporarily to reduce repeated database reads.
* Primary database: Stores authoritative user, note, tag, and relationship records and handles writes.
* Read replica: Serves eligible read queries to reduce load on the primary database; replication may introduce a short delay.
* Message queue: Holds background tasks so the API does not need to complete every task before responding.
* Background worker: Processes queued work such as notifications, scheduled cleanup, and other non-urgent operations.
* Monitoring and logs: Collect service health, error information, latency, and operational metrics to help detect problems.

6. Estimated Load for One Million Users

The following calculations are planning estimates, not measured traffic. Actual demand would depend on user behaviour, note sizes, and product usage.

Assumptions

* Total registered users: 1,000,000.
* Daily active users (DAU): 10% of registered users.
* Each active user makes 50 note-read requests per day.
* Each active user creates one note per day.
* Average stored note size, including an allowance for metadata and indexes: approximately 2 KB.
* There are 86,400 seconds in a day.
* Peak traffic is estimated at five times average read traffic.

Daily active users

[
1{,}000{,}000 \times 0.10 = 100{,}000
]

Estimated daily active users: 100,000.

Reads per second

Daily reads:

[
100{,}000 \times 50 = 5{,}000{,}000
]

Average reads per second:

[
\frac{5{,}000{,}000}{86{,}400} \approx 57.9
]

Estimated average: 58 reads per second.

Estimated peak reads per second:

[
58 \times 5 = 290
]

Estimated peak: 290 reads per second.

Writes per second

Daily note creations:

[
100{,}000 \times 1 = 100{,}000
]

Average writes per second:

[
\frac{100{,}000}{86{,}400} \approx 1.16
]

Estimated average: 1.16 note writes per second. This calculation excludes edits, deletions, tag assignments, and other database writes.

Storage per year

Annual note creations:

[
100{,}000 \times 365 = 36{,}500{,}000
]

Estimated annual storage:

[
36{,}500{,}000 \times 2\text{ KB} = 73\text{ GB}
]

Estimated growth: approximately 73 GB per year for note records under these assumptions. Actual storage will vary with content size, database overhead, indexes, backups, and replication.

These estimates help guide capacity planning. Production monitoring should be used to refine them.

7. GET /notes Request Flow

1. The user opens the notes page in the browser.
2. DNS resolves the application domain.
3. The CDN serves cached static assets when available.
4. The browser sends GET /api/v1/notes?limit=10&offset=0.
5. The load balancer routes the request to a healthy application server.
6. The application server authenticates the user and checks permissions.
7. The server checks the cache for the requested notes.
8. If suitable cached data exists, the server returns it. Otherwise, it queries the database, using the read replica when appropriate.
9. The server returns a paginated JSON response.
10. The client renders the notes and displays a success or error message.

Cache entries should be invalidated or updated when a note changes so users do not keep seeing stale data.

8. POST /notes Request Flow

1. The user enters a title and optional body, then submits the form.
2. The client checks the title and sends POST /api/v1/notes with a JSON body and authentication token.
3. The load balancer forwards the request to a healthy application server.
4. The server authenticates the user, validates the request, and checks permissions.
5. The application writes the new note to the primary database in a transaction.
6. Relevant cached note lists are invalidated or updated.
7. The server returns 201 Created with the new note’s ID and data.
8. The client displays the new note and a success message.
9. If non-urgent work is required, such as sending a notification, the server publishes a task to the message queue for a background worker.

The database write must succeed before the API reports that the note has been created. Queue processing should not be required for the basic note creation response.

9. Architecture Trade-Offs

Cache speed vs data freshness

Caching reduces database load and improves read latency. However, cached data may become stale after an update. QuickNotes can invalidate relevant cache entries after successful writes and use short time-to-live values where appropriate.

Read scaling vs replica lag

A read replica can serve read-heavy workloads without placing all traffic on the primary database. However, replication may lag behind recent writes. Requests that must immediately reflect a successful write should read from the primary database or use another consistency-aware strategy.

Immediate work vs asynchronous processing

Processing notifications and other non-urgent tasks through a queue reduces API response time. The trade-off is eventual processing and the need to handle retries, duplicate messages, and failed tasks.

Strong consistency vs availability during failures

The primary database provides an authoritative record of notes. If it becomes unavailable, writes may need to pause until recovery or failover completes. Replication and backups improve recovery, but they do not eliminate every possible outage or data-loss risk.

10. Avoiding Single Points of Failure

* Run at least two application servers and distribute them across separate availability zones where possible.
* Configure the load balancer to remove unhealthy servers from rotation.
* Use redundant DNS and CDN infrastructure from reliable providers.
* Deploy the database with replication and a tested failover procedure.
* Use a highly available cache and message queue, with appropriate persistence and recovery settings.
* Back up the database regularly and test restoration procedures.
* Monitor latency, error rates, server health, queue depth, and database performance.
* Keep secrets out of source code and use managed secret storage.
* Test recovery procedures and load capacity before major releases.

11. Conclusion

QuickNotes can start as a small web application and grow by separating the client, API, database, caching, and background processing layers. Multiple application servers, a primary database with a read replica, caching, and asynchronous workers provide a foundation for scaling. The estimated traffic figures are initial planning assumptions and should be updated using real production measurements.