#!/usr/bin/env python3
"""Quick API test script"""

import requests
import time

API_URL = "http://localhost:5000"

print("Testing SK NextGen 360 API")
print("=" * 50)

# Test 1: Health Check
print("\n1. Testing health endpoint...")
try:
    response = requests.get(f"{API_URL}/test", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ERROR: {e}")
    print("   Make sure server is running: python run.py")
    exit(1)

# Test 2: Login
print("\n2. Testing login...")
login_data = {
    "email": "admin@test.com",
    "password": "123456"
}

try:
    response = requests.post(f"{API_URL}/api/auth/login", json=login_data)
    print(f"   Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        role = data.get('role')
        name = data.get('name')

        print(f"   SUCCESS!")
        print(f"   Name: {name}")
        print(f"   Role: {role}")
        print(f"   Token: {token[:50]}...")

        # Test 3: Protected endpoint
        print("\n3. Testing protected endpoint...")
        headers = {"Authorization": f"Bearer {token}"}

        response = requests.get(f"{API_URL}/api/admin/users", headers=headers)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            users = response.json()
            print(f"   SUCCESS! Found {len(users)} users")
            for user in users[:3]:
                print(f"      - {user.get('name')} ({user.get('email')})")
        else:
            print(f"   ERROR: {response.text}")

    else:
        print(f"   LOGIN FAILED: {response.text}")

except Exception as e:
    print(f"   ERROR: {e}")

print("\n" + "=" * 50)
print("Test complete!")
print("\nTo start the server: python run.py")
print("API Documentation: http://localhost:5000/docs")
