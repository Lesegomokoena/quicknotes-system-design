
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const statusMessage = document.getElementById("status");
const notesList = document.getElementById("notes-list");

let notes = [];
let nextLocalId = -1;

// Display a status message and style it for success or error.
function setStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = type;
}

// Reusable function for API requests.
async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    // DELETE responses may have no body.
    if (response.status === 204) {
        return { data: null, status: response.status };
    }

    const data = await response.json();

    return { data, status: response.status };
}

// Safely create a note element using textContent.
function createNoteElement(note) {
    const item = document.createElement("li");
    item.className = "note-card";

    const title = document.createElement("h3");
    title.textContent = note.title || "Untitled note";

    const body = document.createElement("p");
    body.textContent = note.body || "No details provided.";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";

    deleteButton.addEventListener("click", () => {
        deleteNote(note.id, deleteButton);
    });

    item.append(title, body, deleteButton);
    return item;
}

// Render the current notes list.
function renderNotes() {
    notesList.replaceChildren();

    if (notes.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "No notes found. Create a note to get started.";
        emptyItem.className = "empty-state";
        notesList.appendChild(emptyItem);
        return;
    }

    notes.forEach((note) => {
        notesList.appendChild(createNoteElement(note));
    });
}

// GET: Load 10 notes from the server.
async function loadNotes() {
    loadButton.disabled = true;
    setStatus("Loading notes...");

    try {
        const result = await request(`${API_URL}?_limit=10`);
        notes = result.data;
        renderNotes();
        setStatus(`Loaded ${notes.length} notes from the server.`, "success");
    } catch (error) {
        setStatus("Sorry, we couldn't load your notes. Please try again.", "error");
        console.error("Load notes error:", error);
    } finally {
        loadButton.disabled = false;
    }
}

// POST: Create a note.
async function createNote(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title) {
        setStatus("Please enter a title for your note.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        setStatus("The title must be 100 characters or fewer.", "error");
        titleInput.focus();
        return;
    }

    submitButton.disabled = true;
    setStatus("Creating note...");

    try {
        const result = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                body,
                userId: 1
            })
        });

        const createdNote = {
            ...result.data,
            // JSONPlaceholder simulates creation but does not persist it.
            // Keep a local copy with a unique temporary ID for this browser session.
            id: nextLocalId--
        };

        notes.unshift(createdNote);
        renderNotes();

        setStatus(
            `Note created (status ${result.status}, id ${result.data.id}).`,
            "success"
        );

        noteForm.reset();
    } catch (error) {
        setStatus("Sorry, we couldn't create your note. Please try again.", "error");
        console.error("Create note error:", error);
    } finally {
        submitButton.disabled = false;
    }
}

// DELETE: Remove a note.
async function deleteNote(id, button) {
    button.disabled = true;
    setStatus("Deleting note...");

    try {
        // JSONPlaceholder simulates DELETE but does not persist changes.
        await request(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        notes = notes.filter((note) => String(note.id) !== String(id));
        renderNotes();
        setStatus("Note deleted successfully.", "success");
    } catch (error) {
        setStatus("Sorry, we couldn't delete that note. Please try again.", "error");
        console.error("Delete note error:", error);
    } finally {
        button.disabled = false;
    }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
