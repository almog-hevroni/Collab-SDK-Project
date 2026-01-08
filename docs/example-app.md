# Android Example Application: Tic-Tac-Toe

This repository contains a **Real-Time Multiplayer Tic-Tac-Toe** game that demonstrates how to integrate and use the **CollabSession SDK**.

The app allows two players to join the same "Room" and play against each other in real-time. It showcases key SDK features like connecting to a session, syncing game state, and handling turn-based logic.

## 📱 Features

- **Lobby Screen:**
  - **Create Game:** Generates a new Room ID for a fresh session.
  - **Join Game:** Allows a second player to enter an existing Room ID to connect.
- **Real-Time Gameplay:**
  - **Live Updates:** Moves (X or O) appear instantly on both screens.
  - **Turn Management:** The app enforces turn rules (Player X vs. Player O).
  - **Win Detection:** Automatically detects winning lines or draws.
- **State Persistence:** If a player disconnects and reconnects, the current board state is reloaded from the server.

## 🛠️ Implementation Highlights

The core logic is found in `GameViewModel.kt` and `GameRepository.kt`.

### 1. Initialization

The app initializes the SDK with a hardcoded API Key (for demonstration purposes) in `GameRepository`.

```kotlin
// GameRepository.kt
val apiKey = "YOUR_API_KEY"
CollabSession.initialize(apiKey)
```

### 2. Game Events (Moves)

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

### 3. State Synchronization

The board state (an array of 9 strings) is saved to the server after every move. This ensures that late joiners or reconnecting players see the correct board.

```kotlin
// Saving state
val stateToSave = mapOf("board" to board)
CollabSession.updateState(roomId, stateToSave)
```

## 🚀 How to Run

1.  **Start the Backend:** Ensure your Node.js backend is running (locally or in the cloud).
2.  **Open in Android Studio:** Open the `android/` folder.
3.  **Run on Device A:**
    - Click "Create New Game".
    - Copy the **Room ID** displayed at the top.
4.  **Run on Device B:**
    - Enter the Room ID from Device A.
    - Click "Join Game".
5.  **Play:** Tap cells to play Tic-Tac-Toe in real-time!
