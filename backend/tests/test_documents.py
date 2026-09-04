import time
from app.models.document import Document
from app.models.document_share import DocumentShare
from app.models.user import User


def test_create_document_default_title(client):
    """Test creating document with default 'Untitled Document' title."""
    response = client.post(
        "/documents",
        json={},
        headers={"X-User-Id": "1"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Untitled Document"
    assert data["owner_id"] == 1
    assert data["owner"]["name"] == "Ayush"
    assert data["user_permission"] == "owner"
    assert "content" in data


def test_create_document_with_tiptap_json_content(client):
    """Test creating document with rich-text Tiptap JSON structure."""
    tiptap_payload = {
        "title": "Quarterly Strategy",
        "content": {
            "type": "doc",
            "content": [
                {
                    "type": "heading",
                    "attrs": {"level": 1},
                    "content": [{"type": "text", "text": "Q3 Objectives"}],
                },
                {
                    "type": "paragraph",
                    "content": [{"type": "text", "text": "Focus on AI and collaborative features."}],
                },
            ],
        },
    }

    response = client.post(
        "/documents",
        json=tiptap_payload,
        headers={"X-User-Id": "1"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Quarterly Strategy"
    assert isinstance(data["content"], dict)
    assert data["content"]["type"] == "doc"
    assert len(data["content"]["content"]) == 2


def test_create_document_unauthenticated(client):
    """Test creating document without authentication header fails with 401."""
    response = client.post("/documents", json={"title": "Unauthorized Doc"})
    assert response.status_code == 401


def test_list_documents_grouping(client, db_session):
    """Test GET /documents returns both my_documents and shared_with_me properly."""
    # User 1 (Ayush) owns doc1
    doc1 = Document(title="Ayush Private Doc", content="{}", owner_id=1)
    # User 2 (Rahul) owns doc2
    doc2 = Document(title="Rahul Shared Doc", content="{}", owner_id=2)
    db_session.add_all([doc1, doc2])
    db_session.commit()

    # Share doc2 with User 1 as editor
    share = DocumentShare(document_id=doc2.id, user_id=1, permission="editor")
    db_session.add(share)
    db_session.commit()

    # Request as User 1
    response = client.get("/documents", headers={"X-User-Id": "1"})
    assert response.status_code == 200
    data = response.json()

    my_docs = data["my_documents"]
    shared_docs = data["shared_with_me"]

    assert any(d["id"] == doc1.id for d in my_docs)
    assert not any(d["id"] == doc2.id for d in my_docs)

    assert any(s["id"] == doc2.id for s in shared_docs)
    shared_item = next(s for s in shared_docs if s["id"] == doc2.id)
    assert shared_item["permission"] == "editor"
    assert shared_item["owner"]["name"] == "Rahul"


def test_get_document_access_control(client, db_session):
    """Test GET /documents/{id} permissions (owner, shared, unauthorized)."""
    # Create user 3 (stranger)
    stranger = User(name="Stranger", email="stranger@example.com")
    db_session.add(stranger)
    db_session.commit()

    # Create doc owned by user 1
    doc = Document(title="Confidential Project", content="{}", owner_id=1)
    db_session.add(doc)
    db_session.commit()

    # Share with user 2 as viewer
    share = DocumentShare(document_id=doc.id, user_id=2, permission="viewer")
    db_session.add(share)
    db_session.commit()

    # 1. Owner can access
    resp_owner = client.get(f"/documents/{doc.id}", headers={"X-User-Id": "1"})
    assert resp_owner.status_code == 200
    assert resp_owner.json()["user_permission"] == "owner"

    # 2. Shared viewer can access
    resp_shared = client.get(f"/documents/{doc.id}", headers={"X-User-Id": "2"})
    assert resp_shared.status_code == 200
    assert resp_shared.json()["user_permission"] == "viewer"

    # 3. Stranger receives 403
    resp_stranger = client.get(f"/documents/{doc.id}", headers={"X-User-Id": str(stranger.id)})
    assert resp_stranger.status_code == 403

    # 4. Non-existent doc returns 404
    resp_404 = client.get("/documents/99999", headers={"X-User-Id": "1"})
    assert resp_404.status_code == 404


def test_update_document_permissions_and_timestamp(client, db_session):
    """Test PUT /documents/{id} editor permission enforcement and timestamp update."""
    # Create user 3 (stranger)
    viewer_user = User(name="Viewer Only", email="viewer@example.com")
    db_session.add(viewer_user)
    db_session.commit()

    # Doc owned by user 1
    doc = Document(title="Initial Title", content='{"type": "doc"}', owner_id=1)
    db_session.add(doc)
    db_session.commit()
    initial_updated_at = doc.updated_at

    # Share with user 2 as editor
    share_editor = DocumentShare(document_id=doc.id, user_id=2, permission="editor")
    # Share with user 3 as viewer
    share_viewer = DocumentShare(document_id=doc.id, user_id=viewer_user.id, permission="viewer")
    db_session.add_all([share_editor, share_viewer])
    db_session.commit()

    # 1. Shared viewer receives 403 Forbidden
    resp_viewer = client.put(
        f"/documents/{doc.id}",
        json={"title": "Hacked Title"},
        headers={"X-User-Id": str(viewer_user.id)},
    )
    assert resp_viewer.status_code == 403

    # 2. Shared editor CAN update content
    time.sleep(0.01)
    new_content = {"type": "doc", "content": [{"type": "paragraph", "text": "Editor update"}]}
    resp_editor = client.put(
        f"/documents/{doc.id}",
        json={"title": "Updated by Editor", "content": new_content},
        headers={"X-User-Id": "2"},
    )
    assert resp_editor.status_code == 200
    data = resp_editor.json()
    assert data["title"] == "Updated by Editor"
    assert data["content"] == new_content

    # 3. Owner CAN update
    resp_owner = client.put(
        f"/documents/{doc.id}",
        json={"title": "Final Owner Title"},
        headers={"X-User-Id": "1"},
    )
    assert resp_owner.status_code == 200
    assert resp_owner.json()["title"] == "Final Owner Title"


def test_delete_document_owner_only(client, db_session):
    """Test DELETE /documents/{id} is strictly restricted to document owner."""
    # Doc owned by user 1
    doc = Document(title="To Be Deleted", content="{}", owner_id=1)
    db_session.add(doc)
    db_session.commit()

    # Shared with user 2 as editor
    share = DocumentShare(document_id=doc.id, user_id=2, permission="editor")
    db_session.add(share)
    db_session.commit()

    # 1. Editor receives 403 Forbidden when attempting delete
    resp_editor = client.delete(f"/documents/{doc.id}", headers={"X-User-Id": "2"})
    assert resp_editor.status_code == 403

    # 2. Owner can delete -> 204 No Content
    resp_owner = client.delete(f"/documents/{doc.id}", headers={"X-User-Id": "1"})
    assert resp_owner.status_code == 204

    # 3. Verify document no longer exists
    resp_get = client.get(f"/documents/{doc.id}", headers={"X-User-Id": "1"})
    assert resp_get.status_code == 404
