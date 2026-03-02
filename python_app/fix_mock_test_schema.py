#!/usr/bin/env python3
"""
Fix mock test table schema
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def fix_schema():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )

    with conn.cursor() as cursor:
        print("Checking mock_tests table structure...")

        # Check if mock_tests has question column (old schema)
        cursor.execute("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'mock_tests' AND column_name = 'question'
        """)
        has_question_col = cursor.fetchone()

        if has_question_col:
            print("Old schema detected - mock_tests has question column")
            print("The existing mock_tests table stores individual questions")
            print("Creating mock_test_questions table for new schema...")

            # Create mock_test_questions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS mock_test_questions (
                    id SERIAL PRIMARY KEY,
                    mock_test_id INTEGER REFERENCES mock_tests(id) ON DELETE CASCADE,
                    question TEXT NOT NULL,
                    option_a TEXT NOT NULL,
                    option_b TEXT NOT NULL,
                    option_c TEXT NOT NULL,
                    option_d TEXT NOT NULL,
                    correct_answer VARCHAR(1) NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            print("  - Created mock_test_questions table")

            # Make question column nullable in mock_tests (for backward compatibility)
            cursor.execute("""
                ALTER TABLE mock_tests
                ALTER COLUMN question DROP NOT NULL;
            """)
            print("  - Made question column nullable in mock_tests")

        else:
            print("New schema detected - creating mock_test_questions table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS mock_test_questions (
                    id SERIAL PRIMARY KEY,
                    mock_test_id INTEGER REFERENCES mock_tests(id) ON DELETE CASCADE,
                    question TEXT NOT NULL,
                    option_a TEXT NOT NULL,
                    option_b TEXT NOT NULL,
                    option_c TEXT NOT NULL,
                    option_d TEXT NOT NULL,
                    correct_answer VARCHAR(1) NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            print("  - Created mock_test_questions table")

        conn.commit()
        print("Schema fixed successfully!")

    conn.close()

if __name__ == "__main__":
    fix_schema()
