# API Service Documentation

The backend service handles authentication, application management, room management, and real-time room events.

## Base URLs

- REST API (cloud): `https://collab-sdk-project.onrender.com/api`
- Socket.io (cloud): `https://collab-sdk-project.onrender.com`

## Authentication (Developer / Portal)

- **Register:** `POST /auth/register`
- **Login:** `POST /auth/login`
- **Get Me:** `GET /auth/me` (requires `Authorization: Bearer <JWT>`)

## Applications (Developer / Portal)

All endpoints require `Authorization: Bearer <JWT>`.

- **Register App (generates API Key):** `POST /apps/register`
  - Body: `{ "name": "My App Name" }`
- **List My Apps:** `GET /apps/my-apps`

## Rooms

### SDK (API Key protected)

All endpoints require header: `x-api-key: <APP_API_KEY>`.

- **Create Room:** `POST /rooms/create`
  - Response includes: `{ success, roomId, message }`
- **Check Room Exists:** `GET /rooms/:roomId`
  - 200 if exists, 404 if not

### Portal (Developer token protected)

All endpoints require `Authorization: Bearer <JWT>`.

- **List Rooms for an App:** `GET /rooms/app/:appId`
- **Delete Room:** `DELETE /rooms/:roomId`

## WebSockets (Socket.io)

### Connect

Connect to the Socket.io server root (example: `http://localhost:3000`).

### Events

#### Client → Server

- `join_room` (payload: `roomId` string)
- `collab_event` (payload: `{ roomId: string, payload: object }`)
  - Server broadcasts `payload` to everyone else in that room
- `update_state` (payload: `{ roomId: string, roomState: any }`)
  - Server persists `roomState` for the room in MongoDB

#### Server → Client

- `collab_event` (payload: object)
  - Used for app events and SDK-level events like:
    - `{ type: "SESSION_INFO", participantIndex: 0 | 1 }`
    - `{ type: "ERROR", message: string }` (e.g., room full)
- `initial_state` (payload: the saved room state from MongoDB, if any)
- `user_joined` (payload: `{ userId: string }`)
