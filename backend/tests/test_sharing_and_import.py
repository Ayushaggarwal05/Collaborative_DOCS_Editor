import io
from app.models.document import Document
from app.models.document_share import DocumentShare
from app.models.user import User


def test_1_user_can_create_a_document(client):
    """Test requirement 1: User can create a document."""
    payload = {
        "title": "Design Specs v1",
        "content": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Hello World"}]}]},
    }
    response = client.post("/documents", json=payload, headers={"X-User-Id": "1"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Design Specs v1"
    assert data["owner_id"] == 1
    assert data["user_permission"] == "owner"


def test_2_owner_can_retrieve_their_document(client, db_session):
    """Test requirement 2: Owner can retrieve their document."""
    doc = Document(title="Owner Private Doc", content="{}", owner_id=1)
    db_session.add(doc)
    db_session.commit()

    response = client.get(f"/documents/{doc.id}", headers={"X-User-Id": "1"})
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == doc.id
    assert data["title"] == "Owner Private Doc"
    assert data["user_permission"] == "owner"


def test_3_shared_user_can_retrieve_a_shared_document(client, db_session):
    """Test requirement 3: Shared user can retrieve a shared document."""
    doc = Document(title="Collaborative Doc", content="{}", owner_id=1)
    db_session.add(doc)
    db_session.commit()

    # Share with Rahul (user 2)
    share = DocumentShare(document_id=doc.id, user_id=2, permission="editor")
    db_session.add(share)
    db_session.commit()

    response = client.get(f"/documents/{doc.id}", headers={"X-User-Id": "2"})
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == doc.id
    assert data["user_permission"] == "editor"


def test_4_unshared_user_receives_403(client, db_session):
    """Test requirement 4: Unshared user receives 403 Forbidden."""
    unshared_user = User(name="Third Party", email="thirdparty@example.com")
    db_session.add(unshared_user)
    doc = Document(title="Top Secret Doc", content="{}", owner_id=1)
    db_session.add(doc)
    db_session.commit()

    response = client.get(f"/documents/{doc.id}", headers={"X-User-Id": str(unshared_user.id)})
    assert response.status_code == 403
    assert "permission" in response.json()["detail"].lower()


def test_5_only_the_owner_can_share_a_document(client, db_session):
    """Test requirement 5: Only the owner can share a document."""
    doc = Document(title="Owner Managed Doc", content="{}", owner_id=1)
    db_session.add(doc)
    db_session.commit()

    # Create third user
    user3 = User(name="Charlie", email="charlie@example.com")
    db_session.add(user3)
    db_session.commit()

    # Rahul (user 2) is given editor access
    share = DocumentShare(document_id=doc.id, user_id=2, permission="editor")
    db_session.add(share)
    db_session.commit()

    # 1. Non-owner (Rahul) tries to share -> 403 Forbidden
    resp_non_owner = client.post(
        f"/documents/{doc.id}/share",
        json={"target_user_id": user3.id, "permission": "editor"},
        headers={"X-User-Id": "2"},
    )
    assert resp_non_owner.status_code == 403
    assert "Only the document owner" in resp_non_owner.json()["detail"]

    # 2. Owner (Ayush, user 1) shares -> 201 Created
    resp_owner = client.post(
        f"/documents/{doc.id}/share",
        json={"target_user_id": user3.id, "permission": "editor"},
        headers={"X-User-Id": "1"},
    )
    assert resp_owner.status_code == 201
    data = resp_owner.json()
    assert data["document_id"] == doc.id
    assert data["user_id"] == user3.id
    assert data["permission"] == "editor"


def test_sharing_validation_rules(client, db_session):
    """Test sharing validation: self-sharing, non-existent target, and duplicate shares."""
    doc = Document(title="Share Validation Doc", content="{}", owner_id=1)
    db_session.add(doc)
    db_session.commit()

    # 1. Cannot share with self
    resp_self = client.post(
        f"/documents/{doc.id}/share",
        json={"target_user_id": 1, "permission": "editor"},
        headers={"X-User-Id": "1"},
    )
    assert resp_self.status_code == 400
    assert "cannot share a document with yourself" in resp_self.json()["detail"].lower()

    # 2. Target user does not exist
    resp_not_found = client.post(
        f"/documents/{doc.id}/share",
        json={"target_user_id": 99999, "permission": "editor"},
        headers={"X-User-Id": "1"},
    )
    assert resp_not_found.status_code == 404
    assert "does not exist" in resp_not_found.json()["detail"]

    # 3. Share with Rahul (user 2)
    resp_ok = client.post(
        f"/documents/{doc.id}/share",
        json={"target_user_id": 2, "permission": "viewer"},
        headers={"X-User-Id": "1"},
    )
    assert resp_ok.status_code == 201

    # 4. Duplicate share prevention
    resp_dup = client.post(
        f"/documents/{doc.id}/share",
        json={"target_user_id": 2, "permission": "editor"},
        headers={"X-User-Id": "1"},
    )
    assert resp_dup.status_code == 400
    assert "already shared" in resp_dup.json()["detail"].lower()


def test_6_txt_and_md_import_works(client):
    """Test requirement 6: .txt and .md file import works and creates editable document."""
    # Test .txt file import
    txt_content = b"Line 1: Project Plan\nLine 2: Milestones and delivery"
    response_txt = client.post(
        "/documents/import",
        files={"file": ("Project Roadmap.txt", io.BytesIO(txt_content), "text/plain")},
        headers={"X-User-Id": "1"},
    )
    assert response_txt.status_code == 201
    data_txt = response_txt.json()
    assert data_txt["title"] == "Project Roadmap"
    assert data_txt["owner_id"] == 1
    assert isinstance(data_txt["content"], dict)
    assert data_txt["content"]["type"] == "doc"

    # Test .md file import
    md_content = b"# Main Architecture\n## Components\nFastAPI backend with SQLite"
    response_md = client.post(
        "/documents/import",
        files={"file": ("Architecture Overview.md", io.BytesIO(md_content), "text/markdown")},
        headers={"X-User-Id": "1"},
    )
    assert response_md.status_code == 201
    data_md = response_md.json()
    assert data_md["title"] == "Architecture Overview"
    assert data_md["owner_id"] == 1
    assert data_md["content"]["content"][0]["type"] == "heading"


def test_7_unsupported_file_types_are_rejected(client):
    """Test requirement 7: Unsupported file types are rejected with 400 Bad Request."""
    dummy_pdf = b"%PDF-1.4 dummy binary content"
    response = client.post(
        "/documents/import",
        files={"file": ("report.pdf", io.BytesIO(dummy_pdf), "application/pdf")},
        headers={"X-User-Id": "1"},
    )
    assert response.status_code == 400
    assert "Unsupported file type '.pdf'" in response.json()["detail"]

    # Test .docx
    dummy_docx = b"PK\x03\x04 dummy docx binary content"
    response_docx = client.post(
        "/documents/import",
        files={"file": ("report.docx", io.BytesIO(dummy_docx), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        headers={"X-User-Id": "1"},
    )
    assert response_docx.status_code == 400
    assert "Unsupported file type '.docx'" in response_docx.json()["detail"]


def test_list_all_users(client):
    """Test GET /users endpoint."""
    response = client.get("/users")
    assert response.status_code == 200
    users = response.json()
    assert len(users) >= 2
    emails = [u["email"] for u in users]
    assert "ayush@example.com" in emails
    assert "rahul@example.com" in emails


def test_revoke_document_share_owner_only(client, db_session):
    """Test revoking document access: owner can revoke, recipient loses access, non-owner gets 403."""
    doc = Document(title="Revocable Doc", content="{}", owner_id=1)
    db_session.add(doc)
    db_session.commit()

    # Share with user 2 (Rahul)
    share = DocumentShare(document_id=doc.id, user_id=2, permission="editor")
    db_session.add(share)
    db_session.commit()

    # User 2 currently has access
    resp_before = client.get(f"/documents/{doc.id}", headers={"X-User-Id": "2"})
    assert resp_before.status_code == 200

    # Non-owner tries to revoke -> 403 Forbidden
    resp_non_owner = client.delete(f"/documents/{doc.id}/share/2", headers={"X-User-Id": "2"})
    assert resp_non_owner.status_code == 403

    # Owner revokes access -> 204 No Content
    resp_owner = client.delete(f"/documents/{doc.id}/share/2", headers={"X-User-Id": "1"})
    assert resp_owner.status_code == 204

    # User 2 now receives 403 Forbidden
    resp_after = client.get(f"/documents/{doc.id}", headers={"X-User-Id": "2"})
    assert resp_after.status_code == 403

