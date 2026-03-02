#!/usr/bin/env python3
"""
Quick script to update database schema
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def update_schema():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )

    with conn.cursor() as cursor:
        print("Adding missing columns to mock_tests table...")

        # Add topic column
        cursor.execute("""
            ALTER TABLE mock_tests
            ADD COLUMN IF NOT EXISTS topic VARCHAR(500);
        """)
        print("  - Added topic column")

        # Add manager_id column
        cursor.execute("""
            ALTER TABLE mock_tests
            ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(id);
        """)
        print("  - Added manager_id column")

        conn.commit()
        print("Schema updated successfully!")

    conn.close()

if __name__ == "__main__":
    update_schema()
