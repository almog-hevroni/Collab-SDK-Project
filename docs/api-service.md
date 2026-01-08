# API Service Documentation

The backend service handles authentication, application management, and real-time room logic.

## Base URL

Local: `http://localhost:3000/api`

## Authentication

- **Login:** `POST /auth/login` - Returns JWT token.
- **Register:** `POST /auth/register` - Creates a new developer account.
- **Get Me:** `GET /auth/me` - Validates token and returns user info.

## Resources

### Applications

- `GET /apps` - List all apps.
- `POST /apps` - Create a new app (generates API Key).
- `DELETE /apps/:id` - Delete an app.

### Rooms

- `GET /rooms` - List active rooms.
- `POST /rooms` - Create a room.
- `DELETE /rooms/:id` - Close a room.

## WebSockets (Socket.io)

Connect to the root URL (e.g., `http://localhost:3000`).

**Events:**

- `join_room`: Client requests to join.
- `send_message`: Client sends a message.
- `receive_message`: Server broadcasts message to room.
