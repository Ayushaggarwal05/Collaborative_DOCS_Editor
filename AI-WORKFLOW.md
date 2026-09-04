# AI Workflow & Engineering Reflection

This document transparently details how AI tools were utilized during the development of **Ajaia Docs**, how outputs were reviewed and modified, and how engineering rigor was maintained throughout the process.

---

## 1. AI Tools Used

- **Google Antigravity IDE (Gemini 3.7 Flash Agent)**: Used as an interactive pair-programming assistant for boilerplate scaffolding, schema design, unit test generation, and TypeScript type verification.

---

## 2. Where AI Accelerated Development

1. **Initial Boilerplate & Project Scaffolding**: Fast generation of standard directory layouts for FastAPI and Vite + React + TypeScript.
2. **SQLAlchemy & Pydantic Schema Definitions**: Rapid mapping of relational database models with foreign keys, cascading relationships, and matching Pydantic response models.
3. **Comprehensive Pytest Suite Generation**: AI drafted comprehensive test fixtures and test cases covering all requirements, edge cases, and constraints.
4. **Tiptap Editor Integration**: Accelerated the configuration of Tiptap StarterKit, custom ProseMirror CSS classes, and toolbar button bindings.

---

## 3. Specific Tasks AI Assisted With

- **Database Constraint Verification**: Writing tests specifically targeting database integrity (e.g., verifying `UniqueConstraint('document_id', 'user_id')` throws `IntegrityError` when duplicate shares are attempted).
- **Markdown & Text Parsing Utility**: Drafting the helper regex/line-parsing logic converting markdown headings (`#`, `##`, `###`) into Tiptap JSON nodes.
- **Tailwind Component Styling**: Producing clean Tailwind CSS styles for the Google Docs-style paper canvas, modal dialogs, and responsive card grids.

---

## 4. AI-Generated Code That Was Modified or Rejected

| Area | Initial AI Output | Problem Identified | Developer Correction |
|---|---|---|---|
| **Pydantic Validation** | AI used `EmailStr` without adding `email-validator` to `requirements.txt`. | Server startup and pytest failed with `ImportError: email-validator is not installed`. | Explicitly updated `requirements.txt` to include `email-validator>=2.0.0` and installed it. |
| **Vite TypeScript Types** | AI generated `src/api/client.ts` using `import.meta.env` without Vite client type declaration. | `npm run build` failed with `Property 'env' does not exist on type 'ImportMeta'`. | Created `src/vite-env.d.ts` with `/// <reference types="vite/client" />` to properly type Vite environment variables. |
| **Delete Confirmation** | AI initially used browser-native `window.confirm()`. | Generic, unstyled, and disrupted the app's visual design system. | Replaced with a custom, accessible `DeleteModal` component with document title confirmation, loading spinner, and keyboard escape handling. |
| **Editor Content Sync** | Initial editor component re-set Tiptap content on every state update. | Cursor jumped to the beginning of the line during active typing. | Added focus and stringified JSON diff checks in `useEffect` so external updates only occur on initial document load or user switch. |
| **Network Error Handling** | Fetch client only caught HTTP error status codes, not network connection failures. | When backend was offline, frontend threw unhandled `TypeError: Failed to fetch`. | Wrapped `fetch` in a `try...catch` block throwing a descriptive `ApiError` explaining that FastAPI server is unreachable. |

---

## 5. How Generated Code Was Reviewed

Every piece of AI-suggested code was reviewed through a multi-stage validation process:

1. **Static Analysis & Type Checking**: Ran `tsc -b` and Vite production build checks to ensure strict TypeScript compliance without type errors or implicit `any` types.
2. **Automated Unit & Integration Testing**: Executed the full test suite (`pytest -v`) across 30 backend test cases running in an isolated in-memory SQLite database.
3. **Live API End-to-End Verification**: Tested the running FastAPI server with automated HTTP request sequences simulating user login, document creation, rich text edits, duplicate sharing attempts, file imports, and cascade deletions.
4. **Code Structure & Maintainability**: Ensured business and authorization logic remained inside `app/services/` rather than leaking into route handlers.

---

## 6. Developer-Led UX Decisions

Rather than accepting default AI suggestions, key product and UX decisions were deliberately guided by the developer:

- **Clean Google Docs Aesthetic**: Designed a centered white page canvas (`max-w-4xl`) with realistic shadow and border tokens to feel like a real document editor rather than a generic text box.
- **Save Status Feedback**: Implemented distinct visual badges (`Saved to cloud`, `Saving...`, `Unsaved changes`, `Save failed`) with a 1.2s auto-save debounce to give writers confidence that their work is safe.
- **Dedicated Error Views**: Built distinct visual error cards for `403 Forbidden` and `404 Not Found` with a direct "Back to Dashboard" button instead of generic blank screens or alert popups.
- **Dashboard Search & Filtering**: Added a title search bar and tabbed filters (`All`, `My Docs`, `Shared`) to make managing growing lists of documents intuitive.

---

## 7. Limitations of AI Encountered

- **Missing Sub-Dependencies**: AI frequently assumed implicit sub-packages (e.g., `email-validator` for Pydantic, `python-multipart` for FastAPI file uploads) without declaring them in dependency files.
- **Edge-Case Validation Gaps**: AI initially omitted self-sharing checks (`target_user_id == current_user.id`), requiring developer intervention to enforce proper validation.
- **Fine-Grained UI Interactivity**: Precise cursor state management and debounced auto-saving in Tiptap required manual tuning to prevent cursor repositioning glitches.
