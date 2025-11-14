import os
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, Numeric, DateTime, text, event
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session as SASession

DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///app.db')

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


class User(Base):
    id = Column(Integer, primary_key=True)
    username = Column(String(255), unique=True, nullable=False)
    telegram_id = Column(String(64), unique=True, nullable=False)
    phone = Column(String(32), nullable=True)
    password = Column(String(255), nullable=False, server_default=text("'telegram_oauth_placeholder'"))


class Product(Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    image_url = Column(Text, nullable=True)


class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    status = Column(String(50), nullable=False, default='pending')
    created_at = Column(DateTime, nullable=False, server_default=text('CURRENT_TIMESTAMP'))

    user = relationship('User')
    product = relationship('Product')


def init_db():
    Base.metadata.create_all(engine)


def ensure_schema():
    with engine.begin() as conn:
        try:
            conn.execute(text('PRAGMA foreign_keys = ON'))
        except Exception:
            pass

        conn.execute(text(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                telegram_id TEXT NOT NULL UNIQUE,
                phone TEXT,
                password TEXT NOT NULL
            )
            """
        ))

        conn.execute(text(
            """
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                price NUMERIC(12,2) NOT NULL DEFAULT 0,
                stock INTEGER NOT NULL DEFAULT 0,
                image_url TEXT
            )
            """
        ))

        conn.execute(text(
            """
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(product_id) REFERENCES products(id)
            )
            """
        ))

        for stmt in [
            "ALTER TABLE users ADD COLUMN telegram_id TEXT",
            "ALTER TABLE users ADD COLUMN phone TEXT",
            "ALTER TABLE users ADD COLUMN password TEXT",
            "ALTER TABLE products ADD COLUMN price NUMERIC(12,2) NOT NULL DEFAULT 0",
            "ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 0",
            "ALTER TABLE products ADD COLUMN image_url TEXT",
            "ALTER TABLE orders ADD COLUMN created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'",
        ]:
            try:
                conn.execute(text(stmt))
            except Exception:
                pass

        # Backfill NULL/empty passwords to avoid NOT NULL failures in legacy rows
        try:
            conn.execute(text("UPDATE users SET password = 'telegram_oauth_placeholder' WHERE password IS NULL OR TRIM(password) = ''"))
        except Exception:
            pass

        try:
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS users_telegram_id_uq ON users(telegram_id)"))
        except Exception:
            pass


@event.listens_for(SASession, 'before_flush')
def _fill_user_password(session, flush_context, instances):
    for obj in session.new:
        if isinstance(obj, User):
            if not getattr(obj, 'password', None) or str(obj.password).strip() == '':
                obj.password = 'telegram_oauth_placeholder'
