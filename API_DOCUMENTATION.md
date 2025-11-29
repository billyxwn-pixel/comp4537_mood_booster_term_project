# Mood Booster Chatbot API Documentation

**Base URL:** `https://mood-booster-backend.onrender.com`  
**API Version:** v1  
**Documentation URL:** `https://mood-booster-backend.onrender.com/doc`

## Table of Contents

1. [Authentication](#authentication)
2. [User Endpoints](#user-endpoints)
3. [Chat Endpoints](#chat-endpoints)
4. [Admin Endpoints](#admin-endpoints)
5. [Database Schema](#database-schema)
6. [Request/Response Formats](#requestresponse-formats)
7. [Error Handling](#error-handling)
8. [Authentication](#authentication-1)

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Register User

**Endpoint:** `POST /api/v1/auth/register`

**Description:** Register a new user account

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "api_calls_used": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Email and password are required, or invalid email format
- `400 Bad Request` - User with this email already exists

---

### Login User

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Login and receive JWT token

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "is_admin": false,
    "api_calls_used": 5
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Email and password are required
- `401 Unauthorized` - Invalid email or password

---

## User Endpoints

### Get User Profile

**Endpoint:** `GET /api/v1/user/profile`

**Description:** Get the authenticated user's profile information

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "is_admin": false,
    "api_calls_used": 5,
    "api_calls_remaining": 15
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - User not found

---

### Update User Profile

**Endpoint:** `PUT /api/v1/user/profile`

**Description:** Update the authenticated user's profile (currently supports email update)

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "email": "newemail@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "newemail@example.com",
    "is_admin": false,
    "api_calls_used": 5,
    "api_calls_remaining": 15
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email format
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - User not found
- `409 Conflict` - Email already exists

---

### Get User Endpoint Usage

**Endpoint:** `GET /api/v1/user/endpoint-usage`

**Description:** Get the authenticated user's API endpoint usage breakdown

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "endpointUsage": [
    {
      "method": "POST",
      "endpoint": "/api/v1/chat/send",
      "request_count": 5
    },
    {
      "method": "GET",
      "endpoint": "/api/v1/user/profile",
      "request_count": 3
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

## Chat Endpoints

### Send Chat Message

**Endpoint:** `POST /api/v1/chat/send`

**Description:** Send a message to the chatbot and receive a response

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "message": "How are you today?"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "response": "I'm doing great! How can I help boost your mood today?",
  "hasExceededLimit": false,
  "apiCallsRemaining": 15,
  "apiCallsUsed": 5
}
```

**Error Responses:**
- `400 Bad Request` - Message is required
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Failed to process message

---

### Get Chat History

**Endpoint:** `GET /api/v1/chat/history`

**Description:** Get the authenticated user's chat history

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "user_message": "Hello",
      "bot_response": "Hi there! How can I help you today?",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "user_message": "How are you?",
      "bot_response": "I'm doing great! Thanks for asking!",
      "created_at": "2024-01-15T10:31:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

## Admin Endpoints

All admin endpoints require admin privileges in addition to authentication.

### Get All Users

**Endpoint:** `GET /api/v1/admin/users`

**Description:** Get a list of all users in the system

**Authentication:** Required (Bearer token + Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "is_admin": false,
      "api_calls_used": 5,
      "created_at": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "email": "admin@admin.com",
      "is_admin": true,
      "api_calls_used": 10,
      "created_at": "2024-01-14T09:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Admin access required

---

### Get User Chat History (Admin)

**Endpoint:** `GET /api/v1/admin/chat-history/:userId`

**Description:** Get chat history for a specific user

**Authentication:** Required (Bearer token + Admin)

**Path Parameters:**
- `userId` (integer, required) - The ID of the user

**Response (200 OK):**
```json
{
  "success": true,
  "userId": 1,
  "history": [
    {
      "id": 1,
      "user_message": "Hello",
      "bot_response": "Hi there!",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid user ID
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Admin access required

---

### Delete User

**Endpoint:** `DELETE /api/v1/admin/users/:userId`

**Description:** Delete a user account

**Authentication:** Required (Bearer token + Admin)

**Path Parameters:**
- `userId` (integer, required) - The ID of the user to delete

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid user ID or cannot delete own account
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Admin access required

---

### Get Endpoint Usage Statistics

**Endpoint:** `GET /api/v1/admin/stats/endpoints`

**Description:** Get global endpoint usage statistics

**Authentication:** Required (Bearer token + Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "stats": [
    {
      "method": "POST",
      "endpoint": "/api/v1/chat/send",
      "request_count": 145
    },
    {
      "method": "GET",
      "endpoint": "/api/v1/user/profile",
      "request_count": 79
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Admin access required

---

### Get User API Consumption Statistics

**Endpoint:** `GET /api/v1/admin/stats/users`

**Description:** Get API consumption statistics for all users

**Authentication:** Required (Bearer token + Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "total_requests": 143,
      "endpoint_breakdown": [
        {
          "method": "POST",
          "endpoint": "/api/v1/chat/send",
          "request_count": 100
        },
        {
          "method": "GET",
          "endpoint": "/api/v1/user/profile",
          "request_count": 43
        }
      ]
    },
    {
      "id": 2,
      "email": "another@example.com",
      "total_requests": 12,
      "endpoint_breakdown": []
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Admin access required

---

## Database Schema

The Mood Booster Chatbot API uses **SQLite** as its database system. The database follows proper normalization principles with separate tables for each entity.

### Database Overview

- **Database Type:** SQLite 3
- **Location (Development):** `backend/database.db`
- **Location (Production):** Configured via `DB_PATH` environment variable
- **Foreign Keys:** Enabled (`PRAGMA foreign_keys = ON`)

### Tables

#### 1. users Table

Stores user account information and authentication data.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| `email` | TEXT | UNIQUE, NOT NULL | User email address (used for login) |
| `password_hash` | TEXT | NOT NULL | Bcrypt hashed password (10 rounds) |
| `is_admin` | INTEGER | DEFAULT 0 | Admin flag (0 = regular user, 1 = admin) |
| `api_calls_used` | INTEGER | DEFAULT 0 | Total number of API calls made by user |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

**Indexes:**
- `idx_email` on `email` column (for fast email lookups)

**Sample Data:**
```sql
id | email              | password_hash          | is_admin | api_calls_used | created_at
1  | admin@admin.com    | $2a$10$abc123...      | 1        | 5              | 2024-01-15 10:00:00
2  | user@example.com | $2a$10$def456...      | 0        | 12             | 2024-01-15 10:05:00
```

---

#### 2. chat_history Table

Stores all chat messages and bot responses for each user.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique message identifier |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY | References users(id) |
| `user_message` | TEXT | NOT NULL | The user's message to the chatbot |
| `bot_response` | TEXT | NOT NULL | The chatbot's response |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

**Indexes:**
- `idx_user_id` on `user_id` column (for fast user history lookups)

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE
  - When a user is deleted, all their chat history is automatically deleted

**Sample Data:**
```sql
id | user_id | user_message      | bot_response                    | created_at
1  | 2       | Hello!            | Hello! How can I help boost...   | 2024-01-15 10:06:00
2  | 2       | I'm feeling sad   | I'm sorry to hear that...        | 2024-01-15 10:07:00
3  | 1       | Test message      | Testing the chatbot...          | 2024-01-15 10:01:00
```

---

#### 3. endpoint_stats Table

Stores global endpoint usage statistics (aggregated across all users).

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique stat identifier |
| `method` | TEXT | NOT NULL | HTTP method (GET, POST, PUT, DELETE) |
| `endpoint` | TEXT | NOT NULL | API endpoint path |
| `request_count` | INTEGER | DEFAULT 0 | Total number of requests to this endpoint |
| `last_updated` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Constraints:**
- `UNIQUE(method, endpoint)` - Ensures one record per endpoint

**Indexes:**
- `idx_endpoint_stats` on `(method, endpoint)` columns

**Sample Data:**
```sql
id | method | endpoint              | request_count | last_updated
1  | POST   | /api/v1/chat/send     | 145           | 2024-01-15 12:00:00
2  | GET    | /api/v1/user/profile  | 79            | 2024-01-15 12:00:00
3  | POST   | /api/v1/auth/login    | 42            | 2024-01-15 12:00:00
```

---

#### 4. user_endpoint_usage Table

Stores per-user endpoint usage statistics for detailed consumption tracking.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique usage record identifier |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY | References users(id) |
| `method` | TEXT | NOT NULL | HTTP method (GET, POST, PUT, DELETE) |
| `endpoint` | TEXT | NOT NULL | API endpoint path |
| `request_count` | INTEGER | DEFAULT 0 | Number of requests by this user to this endpoint |
| `last_used` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last time this user used this endpoint |

**Constraints:**
- `UNIQUE(user_id, method, endpoint)` - Ensures one record per user per endpoint
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
  - When a user is deleted, all their endpoint usage records are automatically deleted

**Indexes:**
- `idx_user_endpoint_usage` on `user_id` column

**Sample Data:**
```sql
id | user_id | method | endpoint              | request_count | last_used
1  | 2       | POST   | /api/v1/chat/send     | 100           | 2024-01-15 11:00:00
2  | 2       | GET    | /api/v1/user/profile  | 43            | 2024-01-15 11:30:00
3  | 1       | GET    | /api/v1/admin/users   | 15            | 2024-01-15 10:30:00
```

---

### Entity Relationships

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │◄────┐
│ email (UNIQUE)  │     │
│ password_hash   │     │
│ is_admin        │     │
│ api_calls_used  │     │
│ created_at      │     │
└─────────────────┘     │
                         │
                         │ 1:N (CASCADE DELETE)
                         │
         ┌───────────────┴───────────────┐
         │                                 │
         │                                 │
┌────────▼────────┐            ┌─────────▼──────────┐
│  chat_history   │            │ user_endpoint_usage │
├─────────────────┤            ├─────────────────────┤
│ id (PK)         │            │ id (PK)              │
│ user_id (FK)    │            │ user_id (FK)         │
│ user_message    │            │ method               │
│ bot_response    │            │ endpoint             │
│ created_at      │            │ request_count        │
└─────────────────┘            │ last_used            │
                                └──────────────────────┘

┌─────────────────┐
│ endpoint_stats  │
├─────────────────┤
│ id (PK)         │
│ method          │
│ endpoint        │
│ request_count   │
│ last_updated    │
└─────────────────┘
(No foreign key - global stats)
```

**Relationship Summary:**
- **users → chat_history**: One-to-Many (CASCADE DELETE)
  - One user can have many chat messages
  - Deleting a user deletes all their chat history
  
- **users → user_endpoint_usage**: One-to-Many (CASCADE DELETE)
  - One user can have many endpoint usage records
  - Deleting a user deletes all their usage statistics

- **endpoint_stats**: Independent table (no foreign keys)
  - Stores global aggregated statistics across all users

---

### Database Design Principles

1. **Proper Normalization**
   - Each entity has its own table
   - No redundant data storage
   - Users and API usage stats are in separate tables

2. **Primary Keys**
   - All tables use `INTEGER PRIMARY KEY AUTOINCREMENT`
   - Unique integer identifiers (not codes like "EN", "JP")

3. **Foreign Key Constraints**
   - Referential integrity enforced
   - CASCADE DELETE for data consistency

4. **Indexes**
   - Created on frequently queried columns
   - Improves query performance

5. **Data Types**
   - Appropriate SQLite types used
   - DATETIME for timestamps
   - INTEGER for numeric values
   - TEXT for strings

---

### Database Operations

#### Creating the Database

The database is automatically created and initialized when the server starts. Tables are created if they don't exist.

#### Querying the Database

**View all tables:**
```sql
.tables
```

**View table schema:**
```sql
.schema users
.schema chat_history
.schema endpoint_stats
.schema user_endpoint_usage
```

**Sample Queries:**

Get all users:
```sql
SELECT * FROM users;
```

Get chat history for a user:
```sql
SELECT * FROM chat_history WHERE user_id = 1 ORDER BY created_at DESC;
```

Get endpoint statistics:
```sql
SELECT method, endpoint, request_count 
FROM endpoint_stats 
ORDER BY request_count DESC;
```

Get user endpoint usage:
```sql
SELECT method, endpoint, request_count 
FROM user_endpoint_usage 
WHERE user_id = 1 
ORDER BY request_count DESC;
```

---

### Security Considerations

1. **Password Storage**
   - Passwords are hashed using bcrypt with 10 rounds
   - Plain text passwords are never stored
   - Password hashes are stored in `password_hash` column

2. **SQL Injection Prevention**
   - All database queries use parameterized statements
   - User input is never directly concatenated into SQL queries
   - Example: `db.get('SELECT * FROM users WHERE email = ?', [email])`

3. **Input Validation**
   - All inputs are validated before database operations
   - Email format validation
   - Number validation for IDs
   - String sanitization to prevent XSS

4. **Data Integrity**
   - Foreign key constraints ensure referential integrity
   - UNIQUE constraints prevent duplicate data
   - NOT NULL constraints ensure required fields

---

### Backup and Maintenance

#### Backup the Database

**Development:**
```bash
cp backend/database.db backend/database.db.backup
```

**Production:**
```bash
# Database location configured via DB_PATH environment variable
# Backup using your hosting provider's backup tools
```

#### View Database Information

**Using SQLite CLI:**
```bash
sqlite3 backend/database.db

# View tables
.tables

# View schema
.schema users
.schema chat_history

# View data
SELECT * FROM users;
SELECT * FROM chat_history LIMIT 10;

# Exit
.quit
```

#### Database File Location

- **Development:** `backend/database.db` (relative to backend directory)
- **Production:** Set via `DB_PATH` environment variable
  - Example: `DB_PATH=/var/data/mood-booster/database.db`

---

### Database Initialization

On first server start, the database:
1. Creates all tables if they don't exist
2. Creates all indexes
3. Initializes default admin user:
   - Email: `admin@admin.com`
   - Password: `111`
   - Admin flag: `1` (true)
4. Optionally creates a test user:
   - Email: `hello@hello.com`
   - Password: `222`
   - Admin flag: `0` (false)

---

## Request/Response Formats

### Content-Type
All requests must use `Content-Type: application/json`

### Response Structure
All responses follow this structure:
```json
{
  "success": boolean,
  "data": object | array,
  "error": string (only present if success is false)
}
```

### Date Format
All dates are returned in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

---

## Error Handling

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Authenticated but insufficient permissions (admin required)
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., email already exists)
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## Authentication

### Getting a Token

1. Register a new user or login with existing credentials
2. The response will include a `token` field
3. Store this token securely (e.g., in localStorage for web apps)

### Using the Token

Include the token in the Authorization header for all protected endpoints:
```
Authorization: Bearer <your_jwt_token>
```

### Token Expiration

Tokens expire after 24 hours. Users must login again to get a new token.

---

## Input Validation

### Email Validation
- Must be a valid email format: `user@domain.com`
- Validated using regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Password Validation
- Minimum length: 3 characters
- No maximum length (but recommended to keep it reasonable)

### Number Validation
- User IDs must be valid integers
- Invalid numbers will return `400 Bad Request`

---

## API Versioning

All endpoints are versioned under `/api/v1/`. Legacy routes without versioning are maintained for backward compatibility but may be deprecated in the future.

---

## Rate Limiting

Users have a free tier limit of 20 API calls. After exceeding this limit, the service continues to work but users are notified of the limitation.

---

## Swagger Documentation

Interactive API documentation is available at:
- **Production:** https://mood-booster-backend.onrender.com/doc
- **Development:** http://localhost:3000/doc

The Swagger UI allows you to:
- View all available endpoints
- See request/response schemas
- Test endpoints directly from the browser
- View authentication requirements

---

## Example Usage

### cURL Examples

**Register a new user:**
```bash
curl -X POST https://mood-booster-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST https://mood-booster-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Get user profile:**
```bash
curl -X GET https://mood-booster-backend.onrender.com/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Send a chat message:**
```bash
curl -X POST https://mood-booster-backend.onrender.com/api/v1/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"message":"Hello, how are you?"}'
```

---

## Support

For API support, contact: support@moodbooster.com

---

**Note:** This API documentation is also available in interactive format at `/doc` endpoint using Swagger UI.

