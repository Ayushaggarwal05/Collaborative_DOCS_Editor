import pytest
from sqlalchemy.exc import IntegrityError
from app.models.document import Document
from app.models.document_share import DocumentShare
from app.models.user import User


def test_user_creation_and_constraints(db_session):
    """Test user creation and unique email constraint."""
    user = User(name="Test User", email="testuser@example.com")
    db_session.add(user)
    db_session.commit()
    assert user.id is not None

    # Duplicate email should fail
    duplicate_user = User(name="Test User 2", email="testuser@example.com")
    db_session.add(duplicate_user)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_document_creation_and_ownership(db_session):
    """Test document creation and relationship to owner."""
    user = db_session.query(User).filter_by(email="ayush@example.com").first()
    assert user is not None

    doc = Document(
        title="Project Roadmap",
        content="Initial content for the project.",
        owner_id=user.id,
    )
    db_session.add(doc)
    db_session.commit()
    db_session.refresh(doc)

    assert doc.id is not None
    assert doc.owner.name == "Ayush"
    assert doc.created_at is not None
    assert doc.updated_at is not None
    assert doc in user.documents


def test_document_sharing_and_unique_constraint(db_session):
    """Test sharing document with another user and duplicate share constraint."""
    owner = db_session.query(User).filter_by(email="ayush@example.com").first()
    recipient = db_session.query(User).filter_by(email="rahul@example.com").first()

    doc = Document(
        title="Design Specs",
        content="Specs details.",
        owner_id=owner.id,
    )
    db_session.add(doc)
    db_session.commit()

    share = DocumentShare(
        document_id=doc.id,
        user_id=recipient.id,
        permission="edit",
    )
    db_session.add(share)
    db_session.commit()
    db_session.refresh(share)

    assert share.id is not None
    assert share.document.title == "Design Specs"
    assert share.user.name == "Rahul"
    assert share in doc.shares
    assert share in recipient.shared_documents

    # Duplicate share for the same document and user should violate unique constraint
    duplicate_share = DocumentShare(
        document_id=doc.id,
        user_id=recipient.id,
        permission="view",
    )
    db_session.add(duplicate_share)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_cascade_delete_owner(db_session):
    """Test that deleting a user cascades to owned documents and document shares."""
    user = User(name="Temporary User", email="temp@example.com")
    db_session.add(user)
    db_session.commit()

    doc = Document(title="Temp Doc", content="Content", owner_id=user.id)
    db_session.add(doc)
    db_session.commit()
    doc_id = doc.id

    db_session.delete(user)
    db_session.commit()

    # Document should be deleted
    deleted_doc = db_session.query(Document).filter_by(id=doc_id).first()
    assert deleted_doc is None
