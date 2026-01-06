package com.example.collabsessionapp.data

import android.content.Context
import android.content.SharedPreferences
import com.example.collab_sdk.CollabSession
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GameRepository(private val context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("CollabPrefs", Context.MODE_PRIVATE)

    // Ensure SDK is initialized with a valid API Key
    suspend fun initializeSdk(): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                var storedApiKey = prefs.getString("api_key", null)

                if (storedApiKey == null) {
                    val reg = CollabSession.registerApp("TicTacToe", "game@demo.com")
                    if (reg != null && reg.success) {
                        storedApiKey = reg.apiKey
                        prefs.edit().putString("api_key", storedApiKey).apply()
                    } else {
                        return@withContext Result.failure(Exception("Registration failed"))
                    }
                }

                CollabSession.initialize(storedApiKey!!)
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun createRoom(): Result<String> {
        return withContext(Dispatchers.IO) {
            val room = CollabSession.createRoom()
            if (room != null) {
                Result.success(room.roomId)
            } else {
                Result.failure(Exception("Failed to create room"))
            }
        }
    }

    suspend fun checkRoom(roomId: String): Boolean {
        return withContext(Dispatchers.IO) {
            CollabSession.checkRoom(roomId)
        }
    }

    fun joinRoom(roomId: String) {
        CollabSession.joinRoom(roomId)
    }

    fun sendMove(roomId: String, index: Int, symbol: String) {
        val moveData = mapOf(
            "type" to "MAKE_MOVE",
            "index" to index,
            "symbol" to symbol
        )
        CollabSession.sendEvent(roomId, moveData)
    }

    fun updateGameState(roomId: String, board: List<String>) {
        val stateToSave = mapOf("board" to board)
        CollabSession.updateState(roomId, stateToSave)
    }

    // Set listener. Note: Ideally, Repositories expose Flows/LiveData,
    // but passing the listener through is acceptable for this callback-based SDK.
    fun setCollabListener(listener: CollabSession.CollabListener) {
        CollabSession.setListener(listener)
    }
}