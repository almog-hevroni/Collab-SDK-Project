## API Service (Backend) — REST + Socket.io

This backend powers the CollabSession ecosystem:
- **Developer / Portal**: register/login, create Apps (API Keys), view rooms
- **SDK / Clients**: create/check Rooms using an App API Key
- **Real-time**: Socket.io events for room join + collaboration + state persistence

### Table of contents
- [Base URLs](#base-urls)
- [Auth models (JWT vs API Key)](#auth-models-jwt-vs-api-key)
- [REST API](#rest-api)
- [WebSockets (Socket.io)](#websockets-socketio)
- [Common errors](#common-errors)

## Base URLs

| Environment | REST base (Express) | Socket.io base |
|---|---|---|
| **Cloud (Render)** | `https://collab-sdk-project.onrender.com/api` | `https://collab-sdk-project.onrender.com` |
| **Local (default)** | `http://localhost:3000/api` | `http://localhost:3000` |

> **Note:** REST endpoints below are shown as **paths** (e.g. `/auth/login`). Prefix them with the REST base above.

## Auth models (JWT vs API Key)

| Who is calling? | What you use | Where it comes from | Header to send |
|---|---|---|---|
| **Developer / Portal** | JWT | `POST /auth/login` or `POST /auth/register` response | `Authorization: Bearer <JWT>` |
| **SDK / Client app** | App API Key | `POST /apps/register` response (`apiKey`) | `x-api-key: <APP_API_KEY>` |

### Typical flow (recommended)
- **Developer**: register/login → register an App → copy the **API Key**
- **SDK**: create a Room / check Room using the **API Key**
- **Clients**: connect via Socket.io → `join_room` → exchange events + persist state

## REST API

### Endpoints (summary)

| Area | Method | Path | Auth | Body | Success response (shape) |
|---|---:|---|---|---|---|
| Auth | POST | `/auth/register` | Public | `{ name, email, password }` | `{ success, _id, name, email, token }` |
| Auth | POST | `/auth/login` | Public | `{ email, password }` | `{ success, _id, name, email, token }` |
| Auth | GET | `/auth/me` | JWT | — | `{ success, data }` |
| Apps | POST | `/apps/register` | JWT | `{ name }` | `{ success, message, apiKey, appId, app }` |
| Apps | GET | `/apps/my-apps` | JWT | — | `{ success, count, data }` |
| Rooms (SDK) | POST | `/rooms/create` | API Key | — | `{ success, roomId, message }` |
| Rooms (SDK) | GET | `/rooms/:roomId` | API Key | — | `{ success, message, room }` |
| Rooms (Portal) | GET | `/rooms/app/:appId` | JWT | — | `{ success, count, data }` |
| Rooms (Portal) | DELETE | `/rooms/:roomId` | JWT | — | `{ success, message }` |

### Copy/paste examples

#### 1) Register (Developer)

```bash
curl -X POST "https://collab-sdk-project.onrender.com/api/auth/register" -H "Content-Type: application/json" -d "{\"name\":\"Your Name\",\"email\":\"you@example.com\",\"password\":\"your-password\"}"
```

#### 2) Login (Developer) → get JWT

```bash
curl -X POST "https://collab-sdk-project.onrender.com/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"you@example.com\",\"password\":\"your-password\"}"
```

#### 3) Register an App → get API Key (JWT required)

```bash
curl -X POST "https://collab-sdk-project.onrender.com/api/apps/register" -H "Content-Type: application/json" -H "Authorization: Bearer <JWT>" -d "{\"name\":\"My App Name\"}"
```

#### 4) Create a Room (API Key required)

```bash
curl -X POST "https://collab-sdk-project.onrender.com/api/rooms/create" -H "x-api-key: <APP_API_KEY>"
```

#### 5) Check if a Room exists (API Key required)

```bash
curl -X GET "https://collab-sdk-project.onrender.com/api/rooms/ABCDE" -H "x-api-key: <APP_API_KEY>"
```

## WebSockets (Socket.io)

### Connect

- **Socket base**: use the Socket.io base URL (no `/api`), e.g. `https://collab-sdk-project.onrender.com`
- **Room capacity**: max **2** participants per room (server assigns index `0` then `1`)

### Events (tables)

#### Client → Server

| Event | Payload | What it does |
|---|---|---|
| `join_room` | `"<roomId>"` | Joins the Socket.io room, assigns participant index, sends initial state |
| `collab_event` | `{ roomId: string, payload: object }` | Broadcasts `payload` to **everyone else** in the room |
| `update_state` | `{ roomId: string, roomState: any }` | Persists `roomState` for the room in MongoDB |

#### Server → Client

| Event | Payload | When you’ll see it |
|---|---|---|
| `collab_event` | `{ type: "SESSION_INFO", participantIndex: 0 \| 1 }` | Immediately after `join_room` (your assigned slot) |
| `collab_event` | `{ type: "ERROR", message: string }` | If room is full (already has 2 participants) |
| `initial_state` | `any` | If the room has saved state in MongoDB |
| `user_joined` | `{ userId: string }` | When another socket joins the same room |

### Minimal client flow (pseudo)

```js
socket.emit("join_room", roomId);

socket.on("collab_event", (payload) => {
  // payload.type === "SESSION_INFO" / "ERROR" / app-specific events
});

socket.on("initial_state", (roomState) => {
  // hydrate local UI/game state from server
});

// send an app event to the other participant(s)
socket.emit("collab_event", { roomId, payload: { type: "MAKE_MOVE", index: 4 } });

// persist authoritative state (server stores it)
socket.emit("update_state", { roomId, roomState: /* any JSON-serializable structure */ {} });
```

## Common errors

| Where | Status | Message (example) | Meaning / fix |
|---|---:|---|---|
| Auth | 400 | `User already exists` | Use a different email, or login instead |
| Auth | 401 | `Invalid email or password` | Check credentials |
| JWT routes | 401 | `Not authorized, no token` | Send `Authorization: Bearer <JWT>` |
| JWT routes | 401 | `Not authorized` | Token missing/expired/invalid |
| SDK routes | 401 | `Access Denied: No API Key provided` | Send `x-api-key: <APP_API_KEY>` |
| SDK routes | 403 | `Invalid API Key` | API key not found / wrong app |
| Rooms | 404 | `Room not found` | Room ID doesn’t exist (or was deleted) |
| Rooms | 403 | `Not authorized to view these rooms` | App doesn’t belong to this developer |
