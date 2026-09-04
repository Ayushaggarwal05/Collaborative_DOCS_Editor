# Ajaia Docs

A clean, lightweight collaborative document editor inspired by Google Docs, built with **FastAPI**, **SQLAlchemy**, **SQLite**, **React**, **TypeScript**, **Tailwind CSS**, and **Tiptap**.

---

## 🚀 Features

- **Demo Authentication**: Instant user switching between seeded accounts (`Ayush` and `Rahul`) without complex passwords or OAuth friction.
- **Document Management**: Create, view, edit, rename, and delete documents with automatic timestamps (`created_at`, `updated_at`).
- **Rich-Text Editor (Tiptap)**: Full formatting toolbar supporting **Bold**, *Italic*, <u>Underline</u>, ~~Strikethrough~~, Headings (H1, H2, H3), Bullet Lists, Numbered Lists, Blockquotes, Inline Code, and Dividers.
- **Live Save & Auto-Save**: Real-time save status indicator (`Saved to cloud`, `Saving...`, `Unsaved changes`) with 1.2s debounced auto-saving and manual `Ctrl+S` / Save button.
- **Access Control & Document Sharing**:
  - Only owners can share, revoke access, or delete documents.
  - Granular permissions: **Editor** (can view and edit) and **Viewer** (read-only mode with disabled toolbar).
  - Dynamic email search & autocomplete with suggestion pills.
  - Duplicate share prevention, self-sharing prevention, and target user validation.
  - **Revoke Access**: Owners can instantly remove collaborator access with one click.
- **Dashboard Organization**: Logical separation into **My Documents** and **Shared With Me**, tab filtering, instant title search, and document cards.
- **File Import**: Import `.txt` and `.md` files directly into new editable documents with automatic Markdown heading/paragraph parsing.
- **Robust Error Handling**: Distinct UI error views for `403 Forbidden` (access restricted), `404 Not Found`, and network disconnection.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.13) |
| **ORM & Database** | [SQLAlchemy 2.0](https://www.sqlalchemy.org/) + [SQLite](https://www.sqlite.org/) |
| **Data Validation** | [Pydantic v2](https://docs.pydantic.dev/) + `pydantic-settings` |
| **Backend Testing** | [pytest](https://docs.pytest.org/) + `httpx` (30 automated tests) |
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Rich-Text Engine** | [Tiptap](https://tiptap.dev/) (ProseMirror) + `@tiptap/starter-kit` + `@tiptap/extension-underline` |
| **Icons & Routing** | [Lucide React](https://lucide.dev/) + [React Router v6](https://reactrouter.com/) |

---

## 📁 Project Structure

```
Ajaia/
├── backend/
│   ├── app/
│   │   ├── config.py             # Pydantic Settings & environment variables
│   │   ├── database.py           # SQLAlchemy engine & session dependency
│   │   ├── dependencies.py       # Auth user resolution dependency
│   │   ├── main.py               # FastAPI entrypoint, CORS, lifespan & error handlers
│   │   ├── seed.py               # Database initialization & demo user seeding
│   │   ├── models/
│   │   │   ├── user.py           # User model
│   │   │   ├── document.py       # Document model
│   │   │   └── document_share.py # DocumentShare model with unique constraints
│   │   ├── schemas/
│   │   │   ├── user.py           # User & Auth Pydantic schemas
│   │   │   ├── document.py       # Document request/response schemas
│   │   │   └── share.py          # Document sharing schemas
│   │   ├── services/
│   │   │   ├── document_service.py # Document business logic
│   │   │   ├── permission_service.py # Centralized authorization checks
│   │   │   ├── share_service.py    # Document sharing & validation
│   │   │   └── import_service.py   # .txt & .md parsing to Tiptap JSON
│   │   └── routers/
│   │       ├── auth.py           # /auth endpoints
│   │       ├── users.py          # /users endpoints
│   │       └── documents.py      # /documents endpoints
│   ├── tests/
│   │   ├── conftest.py           # Isolated in-memory SQLite fixture
│   │   ├── test_health_and_auth.py
│   │   ├── test_models.py
│   │   ├── test_documents.py
│   │   └── test_sharing_and_import.py
│   ├── .env.example
│   ├── .env
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/                  # Centralized API client (client.ts, auth, users, docs)
│   │   ├── components/           # UI components (Navbar, Editor, Toolbar, Modals, Cards)
│   │   ├── context/              # AuthContext session management
│   │   ├── pages/                # LoginPage, DashboardPage, EditorPage
│   │   ├── types/                # TypeScript interfaces
│   │   ├── utils/                # Date formatting and avatar helpers
│   │   ├── App.tsx               # App routing
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts            # Vite proxy configuration
├── ARCHITECTURE.md
├── AI-WORKFLOW.md
├── SUBMISSION.md
└── README.md
```

---

## ⚙️ Local Setup & Installation

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher

---

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Database tables and demo users are **automatically created and seeded** when the application starts.

---

### 2. Frontend Setup

```powershell
# In a separate terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

---

## 🏃 Running the Application

### Start the Backend (Port 8000)
```powershell
cd backend
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```
- **API URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

### Start the Frontend (Port 5173)
```powershell
cd frontend
npm run dev
```
- **Web App**: `http://localhost:5173`

---

## 👥 Seeded Demo Users

| User | Email | Role in Demo |
|---|---|---|
| **Ayush** | `ayush@example.com` | Primary Owner / Writer |
| **Rahul** | `rahul@example.com` | Secondary Owner / Collaborator |

No passwords are required. Simply click on a user card on the Login page to authenticate.

---

## 📄 Supported File Types for Import

| Format | Extension | Behavior |
|---|:---:|---|
| **Plain Text** | `.txt` | Reads text lines and converts them into structured Tiptap paragraphs. |
| **Markdown** | `.md` | Parses `#`, `##`, `###` headings and body paragraphs into Tiptap JSON. |

*Note: Unsupported file formats (such as `.pdf`, `.docx`, `.png`) are rejected with a clear `400 Bad Request` error.*

---

## 📡 API Overview

| Method | Endpoint | Description | Access Level |
|---|---|---|---|
| `GET` | `/health` | Application health check | Public |
| `GET` | `/users` | List all users for sharing dropdown | Authenticated |
| `GET` | `/auth/users` | List demo users for login selector | Public |
| `POST` | `/auth/login` | Simple login by `user_id` or `email` | Public |
| `GET` | `/auth/me` | Fetch currently authenticated user | Authenticated |
| `GET` | `/documents` | List `my_documents` and `shared_with_me` | Authenticated |
| `POST` | `/documents` | Create document with optional title/content | Authenticated |
| `POST` | `/documents/import` | Upload `.txt` or `.md` file as new document | Authenticated |
| `GET` | `/documents/{id}` | Get document content & permissions | Owner / Shared Users |
| `PUT` | `/documents/{id}` | Update document title & content | Owner / Shared Editors |
| `DELETE` | `/documents/{id}` | Delete document permanently | Owner Only |
| `POST` | `/documents/{id}/share` | Share document with a user | Owner Only |
| `DELETE` | `/documents/{id}/share/{user_id}` | Revoke document access for a user | Owner Only |
| `GET` | `/documents/{id}/shares` | List users with document access | Owner / Shared Users |

---

## 🧪 Testing Instructions

### Run Backend Automated Tests (30 Tests)
```powershell
cd backend
.\.venv\Scripts\pytest -v
```
Tests run against an isolated **in-memory SQLite database** and cover:
- Document creation, retrieval, updates, and cascading deletes
- Granular permission matrix (`Owner`, `Editor`, `Viewer`, `Unauthorized`)
- Sharing validations (self-sharing, duplicate shares, invalid users, revoking shares)
- File import parsing (`.txt`, `.md`) and rejection of unsupported file types (`.pdf`, `.docx`)
- Health check and authentication routes

### Run Frontend Production Build Check
```powershell
cd frontend
npm run build
```

---

## ⚠️ Known Limitations

- **Real-Time Concurrent Collaboration**: Multi-cursor real-time editing (via WebSockets/Yjs/CRDTs) is not included; document synchronization relies on fast debounced persistence.
- **Authentication**: Uses lightweight header/session demo authentication tailored for evaluating the assignment rather than production JWT/OAuth.
- **Comments & Version History**: Document commenting and historical revision diffs were intentionally deprioritized to focus on core editor stability, permissions, import, and test coverage.
- **Complex File Formats**: Binary format conversions (PDF, DOCX) are omitted in favor of clean `.txt` and `.md` import.
