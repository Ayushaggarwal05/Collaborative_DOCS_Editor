import logging
from sqlalchemy.orm import Session
from app.database import Base, SessionLocal, engine
from app.models.user import User

logger = logging.getLogger(__name__)

DEMO_USERS = [
    {"name": "Ayush", "email": "ayush@example.com"},
    {"name": "Rahul", "email": "rahul@example.com"},
]


def seed_demo_users(db: Session) -> list[User]:
    """Seed demo users idempotently."""
    created_or_found = []
    for user_data in DEMO_USERS:
        user = db.query(User).filter(User.email == user_data["email"]).first()
        if not user:
            user = User(name=user_data["name"], email=user_data["email"])
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info("Created demo user: %s (%s)", user.name, user.email)
        else:
            logger.info("Demo user already exists: %s (%s)", user.name, user.email)
        created_or_found.append(user)
    return created_or_found


def init_db_and_seed():
    """Create all tables and seed demo users."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        users = seed_demo_users(db)
        return users
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Initializing database and seeding demo users...")
    users = init_db_and_seed()
    print(f"Database initialized with {len(users)} users:")
    for u in users:
        print(f" - [{u.id}] {u.name} <{u.email}>")
