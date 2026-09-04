# Project Submission — Ajaia Docs

### Candidate Information

- **Candidate Name**: Ayush Aggarwal
- **Email**: aayushaggarwal348@gmail.com
- **Position**: AI-Native Full Stack Developer Assignment
- **Project Name**: Ajaia Docs — Collaborative Document Editor

---

## 🔗 Submission Links

| | Link |
|---|---|
| **Live Frontend (Vercel)** | https://frontend-delta-cyan-95.vercel.app/login |
| **Live Backend (API)** | https://collaborative-docs-editor-omega.vercel.app/ |
| **Source Code (GitHub)** | https://github.com/Ayushaggarwal05/Collaborative_DOCS_Editor |
| **Video Walkthrough** | `[PASTE LOOM / YOUTUBE URL HERE]` |

> **Note on deployment**: Both Frontend and Backend are deployed live on Vercel. For local execution, setup instructions and defaults are documented in `README.md`.

---

## ?? Demo Credentials

| User | Email | Role |
|---|---|---|
| **Ayush** | `ayush@example.com` | Primary Owner / Writer |
| **Rahul** | `rahul@example.com` | Secondary Collaborator |

_No passwords required — click any user card on the Login page to authenticate instantly._

---

## ? Implemented Features

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
- Comprehensive validation: prevents self-sharing, rejects non-existent target users, blocks duplicate shares.
- Non-shared users receive `403 Forbidden` with a dedicated access denied UI.

### 5. File Import

- Import `.txt` and `.md` files via `POST /documents/import`.
- Automatic transformation of Markdown headings and paragraphs into structured Tiptap JSON.
- Document title derived automatically from the uploaded filename stem.
- Rejects unsupported formats (`.pdf`, `.docx`, etc.) with `400 Bad Request` and a clear UI error.

### 6. Automated Testing & Reliability

- **30 automated backend tests** in `pytest` using an isolated in-memory SQLite database.
- Tests cover: document CRUD, full permission matrix (owner/editor/viewer/unauthorized), sharing validations, file import parsing, and health/auth routes.
- Full TypeScript compilation validated via `npm run build`.

---

## ?? Known Limitations & Intentional Tradeoffs

| Limitation | Reason |
|---|---|
| No real-time multi-cursor collaboration | Would require WebSockets + Yjs/CRDT — deprioritized in favor of solid core flow |
| Simplified demo auth (no JWT/OAuth) | Keeps reviewer setup frictionless; scope-appropriate for assignment |
| No version history or comments | Deprioritized to maintain depth in editor, sharing, and test coverage |
| No soft delete / trash bin | Permanent delete is simpler and reliable; recovery was not a core requirement |
| No PDF/DOCX import | Binary format parsing is complex; `.txt` and `.md` cover the stated use case cleanly |

---

## ?? What I Would Build With Another 2–4 Hours

1. **Real-Time Collaboration** — Integrate `@tiptap/extension-collaboration` with Yjs + WebSocket server for live cursors and conflict-free editing.
2. **Document Export** — Client-side export to `.md`, `.txt`, or `.pdf` using `jsPDF` or a server-side renderer.
3. **Full-Text Search** — SQLite FTS5 to search document body content, not just titles.
4. **Document Version History** — Snapshot content on each save with a diff viewer.
5. **Trash / Soft Delete** — 30-day bin with one-click document restoration.

---

## ?? What Is Included

| File / Folder | Description |
|---|---|
| `backend/` | FastAPI app — models, schemas, services, routers, seed script |
| `backend/tests/` | 30 pytest tests with in-memory SQLite fixture |
| `backend/requirements.txt` | Python dependencies |
| `frontend/` | React 18 + Vite + TypeScript + Tailwind + Tiptap |
| `README.md` | Full local setup, API reference, and run instructions |
| `ARCHITECTURE.md` | System design, DB schema, permission matrix, and tradeoffs |
| `AI-WORKFLOW.md` | AI tools used, what was changed/rejected, verification approach |
| `SUBMISSION.md` | This file — candidate info, credentials, and feature checklist |
