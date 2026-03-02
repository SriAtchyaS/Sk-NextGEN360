import psycopg2
import psycopg2.extras
from psycopg2 import pool
from contextlib import contextmanager
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection pool
connection_pool = psycopg2.pool.SimpleConnectionPool(
    1, 20,
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    sslmode='require'
)

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = connection_pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        connection_pool.putconn(conn)

@contextmanager
def get_db_cursor(commit=True):
    """Context manager for database cursor"""
    conn = connection_pool.getconn()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        yield cursor
        if commit:
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        connection_pool.putconn(conn)

def test_connection():
    """Test database connection"""
    try:
        with get_db_cursor() as cursor:
            cursor.execute("SELECT NOW()")
            result = cursor.fetchone()
            return {"status": "connected", "time": result['now']}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
