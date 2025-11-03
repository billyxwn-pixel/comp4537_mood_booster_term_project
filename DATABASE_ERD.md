# Database Entity Relationship Diagram (ERD)

## Database Schema

The Mood Booster Chatbot uses SQLite database with the following schema:

### Tables

#### 1. users Table
Stores user account information.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| email | TEXT | UNIQUE, NOT NULL | User email address |
| password_hash | TEXT | NOT NULL | Hashed password (bcrypt) |
| is_admin | INTEGER | DEFAULT 0 | Admin flag (0 = user, 1 = admin) |
| api_calls_used | INTEGER | DEFAULT 0 | Number of API calls used |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

**Indexes:**
- `idx_email` on `email` column

#### 2. chat_history Table
Stores chat messages and responses.

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique message identifier |
| user_id | INTEGER | NOT NULL, FOREIGN KEY | References users(id) |
| user_message | TEXT | NOT NULL | User's message |
| bot_response | TEXT | NOT NULL | Bot's response |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

**Indexes:**
- `idx_user_id` on `user_id` column

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │
│ is_admin        │
│ api_calls_used  │
│ created_at      │
└────────┬────────┘
         │
         │ 1
         │
         │ N
         │
┌────────▼────────┐
│  chat_history   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ user_message    │
│ bot_response    │
│ created_at      │
└─────────────────┘
```

## Relationships

- **One-to-Many**: One user can have many chat history entries
- **Cascade Delete**: When a user is deleted, all their chat history is automatically deleted

## Sample Data

### Users Table
```
id | email              | password_hash | is_admin | api_calls_used | created_at
1  | admin@admin.com    | $2a$10$...    | 1        | 5              | 2024-01-15 10:00:00
2  | john@john.com      | $2a$10$...    | 0        | 12             | 2024-01-15 10:05:00
3  | user@example.com   | $2a$10$...    | 0        | 0              | 2024-01-15 10:10:00
```

### Chat History Table
```
id | user_id | user_message      | bot_response                    | created_at
1  | 2       | Hello!            | Hello! How can I help boost...   | 2024-01-15 10:06:00
2  | 2       | I'm feeling sad    | I'm sorry to hear that...        | 2024-01-15 10:07:00
3  | 1       | Test message       | Testing the chatbot...          | 2024-01-15 10:01:00
```

## Database Location

- **Development**: `backend/database.db`
- **Production**: Configured via `DB_PATH` environment variable

## Security Considerations

1. **Password Storage**: Passwords are hashed using bcrypt (10 rounds)
2. **SQL Injection Prevention**: All queries use parameterized statements
3. **Input Validation**: All inputs are validated and sanitized before database operations

## Backup and Migration

To backup the database:
```bash
cp backend/database.db backend/database.db.backup
```

To view the database structure:
```bash
sqlite3 backend/database.db
.tables
.schema users
.schema chat_history
```
