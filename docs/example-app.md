# Android Example Application: Tic-Tac-Toe

This repository contains a **Real-Time Multiplayer Tic-Tac-Toe** game that demonstrates how to integrate and use the **CollabSession SDK**.

The app allows two players to join the same "Room" and play against each other in real-time. It showcases key SDK features like connecting to a session, syncing game state, and handling turn-based logic.

## 📱 Features

- **Lobby Screen:**
  - **Create Game:** Generates a new Room ID for a fresh session.
  - **Join Game:** Allows a second player to enter an existing Room ID to connect.
- **Real-Time Gameplay:**
  - **Server-Side Roles:** The server automatically assigns "Player X" (Index 0) and "Player O" (Index 1).
  - **Live Updates:** Moves (X or O) appear instantly on both screens.
  - **Turn Management:** The app enforces turn rules (Player X vs. Player O).
  - **Win Detection:** Automatically detects winning lines or draws.
- **State Persistence:** If a player disconnects and reconnects, the current board state is reloaded from the server.
- **Clean Disconnects:** Properly handles users leaving the room so they can rejoin or be replaced.

## 🛠️ Implementation Highlights

The core logic is found in `GameViewModel.kt` and `GameRepository.kt`.

### 1. Initialization

The app initializes the SDK with a hardcoded API Key (for demonstration purposes) in `GameRepository`.

```kotlin
// GameRepository.kt
val apiKey = "YOUR_API_KEY"
CollabSession.initialize(apiKey)
```

### 2. Role Assignment (SESSION_INFO)

Unlike simple implementations where the client guesses their role, this app waits for the server to assign a "Participant Index".

```kotlin
// GameViewModel.kt - onEventReceived
if (type == "SESSION_INFO") {
    val index = (data["participantIndex"] as? Number)?.toInt()
    if (index == 0) {
        mySymbol = "X" // First player
    } else if (index == 1) {
        mySymbol = "O" // Second player
    }
}
```

### 3. Game Events (Moves)

When a player taps a cell, a `MAKE_MOVE` event is broadcast to the room.

```kotlin
// Sending a move
val moveData = mapOf(
    "type" to "MAKE_MOVE",
    "index" to index,
    "symbol" to symbol
)
CollabSession.sendEvent(roomId, moveData)
```

### 4. Leaving the Game

When the user clicks "Exit Game", we explicitly tell the SDK to disconnect. This frees up the "X" or "O" slot on the server.

```kotlin
fun exitGame() {
    repository.leaveSession() // Critical for freeing up server slots
    // ... reset local state ...
}
```

## 🚀 How to Run

1.  **Start the Backend:** Ensure your Node.js backend is running (locally or in the cloud).
2.  **Open in Android Studio:** Open the `android/` folder.
3.  **Run on Device A:**
    - Click "Create New Game".
    - Wait for "You are Player X" toast.
4.  **Run on Device B:**
    - Enter the Room ID from Device A.
    - Click "Join Game".
    - Wait for "You are Player O" toast.
5.  **Play:** Tap cells to play Tic-Tac-Toe in real-time!
