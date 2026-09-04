# Project Submission — Ajaia Docs

### Candidate Information

- **Candidate Name**: Ayush Aggarwal
- **Position**: AI-Native Full Stack Developer Assignment
- **Project Name**: Ajaia Docs — Collaborative Document Editor

---

## 🔗 Submission Links

- **Live Application URL**: `[Live Application URL Placeholder]`
- **Source Code Repository**: `[GitHub Repository Link Placeholder]`
- **Video Walkthrough (Loom/Demo)**: `[Video Walkthrough Link Placeholder]`

---

## 🔑 Demo Credentials

| User      | Email               | Role                   |
| --------- | ------------------- | ---------------------- |
| **Ayush** | `ayush@example.com` | Primary Owner / Writer |
| **Rahul** | `rahul@example.com` | Secondary Collaborator |

_No passwords required — click any user card on the Login page to authenticate._

---

## ✅ Implemented Features

### 1. Authentication & Users

- Demo authentication endpoint (`POST /auth/login`) with session persistence in `localStorage`.
- User listing endpoint (`GET /users`) for populating sharing dialogs.
- Clean user switching and instant logout.

### 2. Document Management (CRUD)

- Create new documents with custom or default title (`"Untitled Document"`).
- List documents logically separated into **My Documents** and **Shared With Me**.
- Retrieve document details with caller permission status (`owner`, `editor`, `viewer`).
- Update title and rich-text content with auto-updating `updated_at` timestamps.
- Permanent deletion with owner-only protection.

### 3. Rich-Text Editor (Tiptap / ProseMirror)

- Google Docs-inspired paper canvas layout with clean typography.
- Formatting toolbar: Bold, Italic, Underline, Strikethrough, Headings (H1, H2, H3), Bullet Lists, Numbered Lists, Blockquotes, Inline Code, and Dividers.
- Real-time save status indicators (`Saved to cloud`, `Saving...`, `Unsaved changes`, `Save error`).
- Debounced auto-save (1200ms) + manual `Ctrl+S` / Save button.
- Read-only enforcement for viewer users.

### 4. Document Sharing & Access Control

- Owner-only sharing endpoint (`POST /documents/{id}/share`).
- Owner-only share revoking endpoint (`DELETE /documents/{id}/share/{user_id}`).
- Granular permission levels: **Editor** (can view and edit) and **Viewer** (read-only).
- Comprehensive validation: prevents self-sharing, rejects non-existent target users, and blocks duplicate shares.
- Non-shared users receive `403 Forbidden` with dedicated access denied UI.

### 5. File Import

- Import `.txt` and `.md` files via `POST /documents/import`.
- Automatic transformation of Markdown headings and paragraphs into structured Tiptap JSON.
- Derives document title from the uploaded filename stem.
- Rejects unsupported formats (`.pdf`, `.docx`, etc.) with `400 Bad Request`.

### 6. Automated Testing & Reliability

- 30 automated backend tests in `pytest` utilizing an isolated in-memory SQLite database.
- Full TypeScript compilation and production bundle validation (`npm run build`).

---

## ⚠️ Known Limitations

1. **Concurrent Real-Time Collaboration**: Collaborative editing uses debounced synchronization rather than WebSocket-based operational transformation (OT) or CRDTs.
2. **Simplified Auth**: Uses a header-based session demo auth model rather than production OAuth/JWT.
3. **No Soft Deletes**: Deleting a document permanently removes the record and associated share entries via database cascading.
4. **No Version History or Comments**: Version diffing and inline comment threads were deprioritized to focus on core editor functionality and test reliability.

---

## ⏱️ What Would Be Built With Another 2–4 Hours

1. **Document Export**: Add client-side or server-side export options to download documents as `.md`, `.txt`, `.html`, or `.pdf`.
2. **Real-Time Collaboration with Yjs & WebSockets**: Integrate `@tiptap/extension-collaboration` with a lightweight WebSocket backend to support multi-user live cursors.
3. **Document Duplication & Templates**: Add a "Duplicate Document" action and pre-built starter templates (e.g., Meeting Notes, Project Proposal).
4. **Trash / Soft Delete Recovery**: Add a 30-day trash bin with document restoration capability before permanent deletion.
5. **Full-Text Document Search**: Implement SQLite FTS5 (Full-Text Search) to enable searching document content in addition to titles.

---

## 📦 Included Deliverables

1. **Backend**: Complete FastAPI application in `backend/` with SQLAlchemy models, Pydantic schemas, modular services, demo auth, and seed scripts.
2. **Frontend**: Complete React 18 + Vite + TypeScript application in `frontend/` with Tailwind CSS and Tiptap editor.
3. **Test Suite**: 29 automated tests in `backend/tests/` covering models, CRUD, sharing, import, and edge cases.
4. **Documentation**:
   - [`README.md`](file:///k:/Work/Assignment%20for%20job/Ajaia/README.md): Project overview, setup guides, API reference, and running instructions.
   - [`ARCHITECTURE.md`](file:///k:/Work/Assignment%20for%20job/Ajaia/ARCHITECTURE.md): System architecture, database schema, permission matrix, and design tradeoffs.
   - [`AI-WORKFLOW.md`](file:///k:/Work/Assignment%20for%20job/Ajaia/AI-WORKFLOW.md): Transparent AI tool usage, modifications, code review, and developer-led decisions.
   - [`SUBMISSION.md`](file:///k:/Work/Assignment%20for%20job/Ajaia/SUBMISSION.md): Candidate submission details, credentials, and feature checklist.
