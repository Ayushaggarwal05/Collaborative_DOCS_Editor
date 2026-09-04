import json
import os
from pathlib import Path
from typing import Set
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentResponse
from app.schemas.user import UserResponse

ALLOWED_EXTENSIONS: Set[str] = {".txt", ".md"}


def _text_to_tiptap_json(text: str) -> dict:
    """Convert raw text or markdown text into standard Tiptap JSON document format."""
    paragraphs = []
    lines = text.splitlines()

    if not lines:
        return {"type": "doc", "content": [{"type": "paragraph"}]}

    for line in lines:
        if line.strip():
            # Check for simple markdown heading
            if line.startswith("# "):
                paragraphs.append({
                    "type": "heading",
                    "attrs": {"level": 1},
                    "content": [{"type": "text", "text": line[2:].strip()}],
                })
            elif line.startswith("## "):
                paragraphs.append({
                    "type": "heading",
                    "attrs": {"level": 2},
                    "content": [{"type": "text", "text": line[3:].strip()}],
                })
            elif line.startswith("### "):
                paragraphs.append({
                    "type": "heading",
                    "attrs": {"level": 3},
                    "content": [{"type": "text", "text": line[4:].strip()}],
                })
            else:
                paragraphs.append({
                    "type": "paragraph",
                    "content": [{"type": "text", "text": line}],
                })
        else:
            paragraphs.append({"type": "paragraph"})

    return {"type": "doc", "content": paragraphs}


async def import_document_file(
    db: Session,
    file: UploadFile,
    current_user: User,
) -> DocumentResponse:
    """Import a .txt or .md file as a new editable document."""
    original_filename = file.filename or "Imported Document.txt"
    file_ext = os.path.splitext(original_filename)[1].lower()

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{file_ext}'. Only .txt and .md files are supported.",
        )

    try:
        content_bytes = await file.read()
        text_content = content_bytes.decode("utf-8", errors="replace")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read and decode file: {str(e)}",
        )

    # Derive document title from filename
    title = Path(original_filename).stem.strip() or "Imported Document"

    # Convert to Tiptap JSON structure
    tiptap_doc = _text_to_tiptap_json(text_content)
    serialized_content = json.dumps(tiptap_doc)

    doc = Document(
        title=title,
        content=serialized_content,
        owner_id=current_user.id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return DocumentResponse(
        id=doc.id,
        title=doc.title,
        content=doc.content,
        owner_id=doc.owner_id,
        owner=UserResponse.model_validate(current_user),
        user_permission="owner",
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )
