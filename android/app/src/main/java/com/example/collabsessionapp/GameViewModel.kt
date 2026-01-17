package com.example.collabsessionapp

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.example.collab_sdk.CollabSession
import com.example.collabsessionapp.data.GameRepository
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch

class GameViewModel(application: Application) : AndroidViewModel(application), CollabSession.CollabListener {

    private val repository = GameRepository(application)

    // --- LiveData State (Persistent UI State) ---
    private val _boardState = MutableLiveData(Array(9) { "" })
    val boardState: LiveData<Array<String>> = _boardState

    private val _statusText = MutableLiveData<String>()
    val statusText: LiveData<String> = _statusText

    private val _roomCode = MutableLiveData<String>("Room: -----")
    val roomCode: LiveData<String> = _roomCode

    private val _gameState = MutableLiveData<GameState>()
    val gameState: LiveData<GameState> = _gameState

    private val _winningLine = MutableLiveData<List<Int>?>(null)
    val winningLine: LiveData<List<Int>?> = _winningLine

    // --- One-Time Events (Toast Messages) ---
    // Channel is perfect for "fire and forget" events
    private val _toastEvent = Channel<String>()
    val toastEvent = _toastEvent.receiveAsFlow()

    // --- Internal State ---
    private var currentRoomId: String? = null
    private var mySymbol = ""
    private var currentTurn = "X"
    private var isGameActive = true

    enum class GameState { LOBBY, GAME }

    init {
        repository.setCollabListener(this)
        _gameState.value = GameState.LOBBY
    }

    // --- Helper to send toast ---
    private fun sendToast(message: String) {
        viewModelScope.launch {
            _toastEvent.send(message)
        }
    }

    // --- User Actions ---

    fun createSession() {
        mySymbol = ""
        connectAndSetup(isNewRoom = true)
    }

    fun joinSession(inputRoomId: String) {
        if (inputRoomId.isBlank()) {
            sendToast("Please enter a Room ID")
            return
        }
        mySymbol = ""
        connectAndSetup(isNewRoom = false, roomIdInput = inputRoomId)
    }

    fun onCellClicked(index: Int) {
        if (!isGameActive) {
            sendToast("Game Over! Exit to restart.")
            return
        }

        val currentBoard = _boardState.value ?: return
        if (currentBoard[index].isNotEmpty()) return

        if (mySymbol.isEmpty()) {
            sendToast("Waiting for role assignment...")
            return
        }

        if (mySymbol != currentTurn) {
            sendToast("Wait for opponent's turn!")
            return
        }

        // 1. Local Update
        updateCell(index, mySymbol)

        // 2. Network Update
        currentRoomId?.let { roomId ->
            repository.sendMove(roomId, index, mySymbol)
            
            // Determine Game Status
            var status = "PLAYING"
            var winner = ""
            
            if (checkWinner(currentBoard, mySymbol)) {
                 status = "GAME_OVER"
                 winner = mySymbol
            } else if (currentBoard.none { it.isEmpty() }) {
                 status = "GAME_OVER"
                 winner = "DRAW"
            }

            repository.updateGameState(roomId, currentBoard.toList(), status, winner)
        }
    }

    fun exitGame() {
        repository.leaveSession()
        currentRoomId = null
        isGameActive = true
        resetBoardLocally()
        _roomCode.value = "Room: -----"
        _gameState.value = GameState.LOBBY
    }

    // --- Internal Logic ---

    private fun connectAndSetup(isNewRoom: Boolean, roomIdInput: String? = null) {
        viewModelScope.launch {
            // 1. Initialize SDK
            val initResult = repository.initializeSdk()
            if (initResult.isFailure) {
                sendToast("Error initializing: ${initResult.exceptionOrNull()?.message}")
                return@launch
            }

            // 2. Create or Join Room
            if (isNewRoom) {
                val result = repository.createRoom()
                result.onSuccess { roomId -> joinTheRoom(roomId) }
                result.onFailure { sendToast("Error creating room") }
            } else {
                val exists = repository.checkRoom(roomIdInput!!)
                if (exists) {
                    joinTheRoom(roomIdInput)
                } else {
                    sendToast("Room Not Found")
                }
            }
        }
    }

    private fun joinTheRoom(roomId: String) {
        currentRoomId = roomId
        isGameActive = true
        currentTurn = "X"
        resetBoardLocally()

        _roomCode.postValue("Room Code: $roomId")
        _gameState.postValue(GameState.GAME)
        updateStatusText()

        repository.joinRoom(roomId)
    }

    // --- Helper Logic ---

    private fun resetBoardLocally() {
        _boardState.postValue(Array(9) { "" })
        _winningLine.postValue(null)
    }

    private fun updateCell(index: Int, symbol: String) {
        val currentBoard = _boardState.value ?: Array(9) { "" }
        currentBoard[index] = symbol
        _boardState.postValue(currentBoard)

        if (checkWinner(currentBoard, symbol)) {
            isGameActive = false
            _statusText.postValue("GAME OVER: $symbol Wins!")
            return
        }
        if (currentBoard.none { it.isEmpty() }) {
            isGameActive = false
            _statusText.postValue("GAME OVER: It's a Draw!")
            return
        }
        recalculateTurn(currentBoard)
        updateStatusText()
    }

    private fun checkWinner(board: Array<String>, lastSymbol: String): Boolean {
        val wins = arrayOf(
            intArrayOf(0, 1, 2), intArrayOf(3, 4, 5), intArrayOf(6, 7, 8),
            intArrayOf(0, 3, 6), intArrayOf(1, 4, 7), intArrayOf(2, 5, 8),
            intArrayOf(0, 4, 8), intArrayOf(2, 4, 6)
        )
        for ((x, y, z) in wins) {
            if (board[x].isNotEmpty() && board[x] == board[y] && board[x] == board[z]) {
                _winningLine.postValue(listOf(x, y, z))
                return true
            }
        }
        return false
    }

    private fun recalculateTurn(board: Array<String>) {
        if (!isGameActive) return
        var xCount = 0
        var oCount = 0
        for (s in board) {
            if (s == "X") xCount++
            if (s == "O") oCount++
        }
        currentTurn = if (xCount <= oCount) "X" else "O"
    }

    private fun updateStatusText() {
        if (!isGameActive) return
        if (mySymbol.isEmpty()) {
            _statusText.postValue("Connecting to Server...")
            return
        }
        val turnMsg = if (mySymbol == currentTurn) "YOUR TURN" else "Waiting for $currentTurn..."
        _statusText.postValue("You are $mySymbol | $turnMsg")
    }

    // --- SDK Callbacks ---

    override fun onStateLoaded(state: Any) {
        try {
            val map = state as? Map<String, Any>
            val boardList = map?.get("board") as? List<String>

            if (boardList != null && boardList.size == 9) {
                val newBoard = boardList.toTypedArray()
                _boardState.postValue(newBoard)

                isGameActive = true
                if (checkWinner(newBoard, "X") || checkWinner(newBoard, "O")) {
                    isGameActive = false
                    _statusText.postValue("Game Over (Loaded)")
                } else if (newBoard.none { it.isEmpty() }) {
                    isGameActive = false
                    _statusText.postValue("Game Over: Draw")
                } else {
                    recalculateTurn(newBoard)
                    updateStatusText()
                }
            }
        } catch (e: Exception) {
            Log.e("GameVM", "Error parsing state: ${e.message}")
        }
    }

    override fun onEventReceived(data: Map<String, Any>) {
        try {
            val type = data["type"] as? String

            // --- Generic SDK Event: SESSION_INFO ---
            if (type == "SESSION_INFO") {
                val index = (data["participantIndex"] as? Number)?.toInt()
                if (index == 0) {
                    mySymbol = "X"
                } else if (index == 1) {
                    mySymbol = "O"
                } else {
                    sendToast("Observer Mode") // Optional: Generic observer handling
                }
                updateStatusText()
                return
            }

            // --- Generic SDK Event: ERROR ---
            if (type == "ERROR") {
                val msg = data["message"] as? String
                sendToast(msg ?: "Error")
                exitGame() // Kick user out if room is full
                return
            }

            // --- App Specific Event: MAKE_MOVE ---
            if (type == "MAKE_MOVE") {
                val index = (data["index"] as? Number)?.toInt() ?: return
                val symbol = data["symbol"] as? String ?: return
                updateCell(index, symbol)
            }
        } catch (e: Exception) {
            Log.e("GameVM", "Error event: ${e.message}")
        }
    }
}
