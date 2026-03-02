# Login Credentials for SK NextGen 360

## Available Users

### Admin Account
- **Email**: admin@test.com
- **Password**: 123456
- **Role**: Admin
- **Access**: Full system access

### Manager Account
- **Email**: datamanager@test.com
- **Password**: (Use existing password or reset via database)
- **Role**: Manager
- **Access**: Manage freshers, create tests, view reports

### Fresher Accounts
1. **Email**: fresher@test.com
   - **Role**: Fresher

2. **Email**: franklin@shellkode.com
   - **Role**: Fresher

## How to Login

### Using API (Swagger UI)

1. Go to: http://localhost:5000/docs
2. Find **POST /api/auth/login**
3. Click "Try it out"
4. Enter credentials:
```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```
5. Click "Execute"
6. Copy the `token` from the response
7. Click "Authorize" button at the top
8. Enter: `Bearer YOUR_TOKEN_HERE`
9. Now you can use all protected endpoints!

### Using cURL

```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "123456"
  }'
```

### Using Python

```python
import requests

response = requests.post('http://localhost:5000/api/auth/login', json={
    'email': 'admin@test.com',
    'password': '123456'
})

data = response.json()
token = data['token']
print(f"Token: {token}")

# Use the token in subsequent requests
headers = {'Authorization': f'Bearer {token}'}
users = requests.get('http://localhost:5000/api/admin/users', headers=headers)
print(users.json())
```

### Using JavaScript/React

```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.role);
  return data;
};

// Usage
login('admin@test.com', '123456').then(data => {
  console.log('Logged in as:', data.name);
});
```

## Creating New Users

### As Admin (via API)

```bash
curl -X POST "http://localhost:5000/api/admin/create-user" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "fresher",
    "department": "IT",
    "manager_id": 2
  }'
```

## Password Reset

If you need to reset a password, run this Python script:

```python
from app.auth.jwt_handler import get_password_hash
from app.database import get_db_cursor

email = "user@example.com"
new_password = "newpassword123"
hashed = get_password_hash(new_password)

with get_db_cursor() as cursor:
    cursor.execute(
        "UPDATE users SET password = %s WHERE email = %s",
        (hashed, email)
    )
    print(f"Password updated for {email}")
```

## Troubleshooting

### Login Failed
1. **Check credentials**: Verify email and password are correct
2. **Check database**: Ensure user exists in database
3. **Check server**: Make sure server is running on port 5000
4. **Check logs**: Look at server console for error messages

### Token Issues
1. **Token expired**: Login again to get a new token (expires after 24 hours)
2. **Invalid token**: Check that you're using `Bearer TOKEN_HERE` format
3. **Missing token**: Make sure Authorization header is included

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "User not found" | Email doesn't exist | Check email spelling |
| "Invalid password" | Wrong password | Use correct password |
| "Access denied" | No token provided | Include Authorization header |
| "Invalid token" | Token expired/malformed | Login again |
| "Forbidden" | Wrong role for endpoint | Use account with correct role |

## API Testing with Postman

1. **Login Request**:
   - Method: POST
   - URL: http://localhost:5000/api/auth/login
   - Body (JSON):
     ```json
     {
       "email": "admin@test.com",
       "password": "123456"
     }
     ```

2. **Save Token**:
   - Copy token from response
   - Go to Authorization tab
   - Type: Bearer Token
   - Paste token

3. **Test Protected Endpoint**:
   - Method: GET
   - URL: http://localhost:5000/api/admin/users
   - Authorization: Bearer Token (from step 2)

## Security Notes

⚠️ **Important for Production**:
1. Change all default passwords
2. Use strong passwords (12+ characters)
3. Update JWT_SECRET in .env file
4. Enable HTTPS
5. Implement rate limiting
6. Add password complexity requirements

## Need Help?

Run the test script to verify login is working:
```bash
python test_login.py
```

This will:
- Check database connection
- List all users
- Test password verification
- Create a test user if none exist
