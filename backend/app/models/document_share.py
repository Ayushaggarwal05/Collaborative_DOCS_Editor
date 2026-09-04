from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.database import Base


class DocumentShare(Base):
    __tablename__ = "document_shares"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    permission = Column(String(50), nullable=False, default="view")  # e.g., 'view', 'edit'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("document_id", "user_id", name="uq_document_user_share"),
    )

    # Relationships
    document = relationship("Document", back_populates="shares")
    user = relationship("User", back_populates="shared_documents")

    def __repr__(self) -> str:
        return f"<DocumentShare(id={self.id}, doc_id={self.document_id}, user_id={self.user_id}, perm='{self.permission}')>"
