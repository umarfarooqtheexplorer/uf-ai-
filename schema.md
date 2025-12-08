# UF AI Relational Database Schema

This document outlines the relational database schema for the UF AI application. This schema is designed for scalability, data integrity, and efficient querying.

---

## 1. `Users` Table

Stores the primary profile information for each user.

| Column          | Data Type      | Description                                       | Constraints                     |
|-----------------|----------------|---------------------------------------------------|---------------------------------|
| `id`            | `INT` / `SERIAL` | The unique identifier for the user.               | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `google_uid`    | `VARCHAR(255)` | The unique identifier from Google Sign-In.        | `UNIQUE`, `NULLABLE`            |
| `name`          | `VARCHAR(255)` | User's display name.                              | `NOT NULL`                      |
| `email`         | `VARCHAR(255)` | User's email address.                             | `UNIQUE`, `NOT NULL`            |
| `profile_picture` | `VARCHAR(2048)`| URL to the user's profile picture.              | `NULLABLE`                      |
| `created_at`    | `TIMESTAMP`    | Timestamp of when the account was created.        | `NOT NULL`, `DEFAULT NOW()`     |
| `last_login`    | `TIMESTAMP`    | Timestamp of the user's last login.               | `NULLABLE`                      |

**Notes:**
- The `google_uid` is nullable to accommodate other authentication methods (like the current name/password system).
- An index should be created on the `email` and `google_uid` columns for fast lookups.

---

## 2. `Chats` Table

Stores metadata for each chat session.

| Column      | Data Type      | Description                                  | Constraints                     |
|-------------|----------------|----------------------------------------------|---------------------------------|
| `id`        | `INT` / `SERIAL` | The unique identifier for the chat session.  | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `user_id`   | `INT`          | Foreign key referencing the `Users` table.   | `NOT NULL`, `FOREIGN KEY`       |
| `title`     | `VARCHAR(255)` | A title for the chat session.                | `NOT NULL`                      |
| `created_at`| `TIMESTAMP`    | Timestamp of when the chat was created.      | `NOT NULL`, `DEFAULT NOW()`     |

**Notes:**
- An index should be created on the `user_id` column to efficiently retrieve all chats for a specific user.

---

## 3. `Messages` Table

Stores the individual messages within each chat session. This one-to-many relationship is more scalable than embedding messages in the `Chats` table.

| Column      | Data Type                   | Description                                   | Constraints                     |
|-------------|-----------------------------|-----------------------------------------------|---------------------------------|
| `id`        | `INT` / `SERIAL`              | The unique identifier for the message.        | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `chat_id`   | `INT`                       | Foreign key referencing the `Chats` table.    | `NOT NULL`, `FOREIGN KEY`       |
| `role`      | `ENUM('user', 'assistant')` | The role of the message sender.               | `NOT NULL`                      |
| `content`   | `TEXT`                      | The content of the message (prompt/response). | `NOT NULL`                      |
| `created_at`| `TIMESTAMP`                 | Timestamp of when the message was created.    | `NOT NULL`, `DEFAULT NOW()`     |

**Notes:**
- An index should be created on the `chat_id` column to quickly fetch all messages for a given chat.

---

## 4. `UserSettings` Table

Stores personalized settings for each user in a one-to-one relationship with the `Users` table.

| Column            | Data Type     | Description                                     | Constraints                     |
|-------------------|---------------|-------------------------------------------------|---------------------------------|
| `user_id`         | `INT`         | Foreign key referencing the `Users` table.      | `PRIMARY KEY`, `FOREIGN KEY`    |
| `theme`           | `VARCHAR(50)` | The user's preferred theme (e.g., 'light', 'dark').| `DEFAULT 'dark'`                |
| `language`        | `VARCHAR(10)` | The user's preferred language (e.g., 'en-US').  | `DEFAULT 'en-US'`               |
| `api_usage_count` | `INT`         | A counter for API calls or other metered usage. | `DEFAULT 0`                     |
| `chat_style`      | `VARCHAR(50)` | The preferred AI chat style.                    | `DEFAULT 'Friendly'`            |
