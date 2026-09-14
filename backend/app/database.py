from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import DB_STORAGE

connect_args = {}
url = DB_STORAGE
if not DB_STORAGE.startswith('sqlite'):
    url = 'sqlite:///{}'.format(DB_STORAGE)
if url.startswith('sqlite'):
    connect_args = {'check_same_thread': False}

engine = create_engine(url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _seed_if_empty()


def _seed_if_empty():
    import os

    try:
        from app.config import IS_SERVERLESS
        if not IS_SERVERLESS and os.path.exists('database.seeded'):
            return
    except Exception:
        pass

    try:
        from app.models import Permission
        from sqlalchemy.orm import Session

        session = Session(bind=engine)
        try:
            if session.query(Permission).count() == 0:
                from app.seed import seed

                seed()
        finally:
            session.close()
    except Exception:
        pass