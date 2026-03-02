#!/usr/bin/env python3
"""Test script to debug login issues"""

from app.database import get_db_cursor
from app.auth.jwt_handler import verify_password, get_password_hash
import psycopg2.extras

print("Checking database and users...")
print("=" * 50)

try:
    with get_db_cursor(commit=False) as cursor:
        # Check if users table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'users'
            )
        """)
        table_exists = cursor.fetchone()
        print(f"Users table exists: {table_exists['exists']}")

        if not table_exists['exists']:
            print("\nERROR: Users table doesn't exist!")
            print("You need to create the database schema first.")
            exit(1)

        # Check users in database
        cursor.execute("SELECT id, name, email, role FROM users LIMIT 5")
        users = cursor.fetchall()

        print(f"\nFound {len(users)} users:")
        for user in users:
            print(f"  - {user['name']} ({user['email']}) - Role: {user['role']}")

        if len(users) == 0:
            print("\nWARNING: No users found in database!")
            print("Creating a test admin user...")

            # Create test admin
            test_email = "admin@test.com"
            test_password = "admin123"
            hashed = get_password_hash(test_password)

            cursor.execute(
                """INSERT INTO users (name, email, password, role, department)
                   VALUES (%s, %s, %s, %s, %s)
                   RETURNING id, name, email, role""",
                ("Test Admin", test_email, hashed, "admin", "IT")
            )
            # Need to commit this change
            cursor.connection.commit()

            new_user = cursor.fetchone()
            print(f"SUCCESS: Created test user:")
            print(f"   Email: {test_email}")
            print(f"   Password: {test_password}")
            print(f"   Role: {new_user['role']}")

        # Test password verification with first user
        if len(users) > 0:
            print(f"\nTesting password for: {users[0]['email']}")
            cursor.execute("SELECT password FROM users WHERE email = %s", (users[0]['email'],))
            user_data = cursor.fetchone()

            # Test with common passwords
            test_passwords = ["admin123", "password123", "admin", "password", "123456"]

            print("Testing common passwords...")
            for pwd in test_passwords:
                if verify_password(pwd, user_data['password']):
                    print(f"SUCCESS: Password '{pwd}' works for {users[0]['email']}")
                    break
            else:
                print("ERROR: None of the common passwords work")
                print("You may need to reset the password")

except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 50)
print("Test complete!")
