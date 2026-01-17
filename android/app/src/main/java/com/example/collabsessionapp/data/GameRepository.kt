package com.example.collabsessionapp.data

import android.content.Context
import android.content.SharedPreferences
import com.example.collab_sdk.CollabSession
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GameRepository(private val context: Context) {

    // Ensure SDK is initialized with a valid API Key
    suspend fun initializeSdk(): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                // Hardcoded API Key from Developer Portal
                val apiKey = "4b68d7a1-88db-4255-ae38-fd96251f6d88"
                
                // Cloud URL
                val serverUrl = "https://collab-sdk-project.onrender.com/"

                CollabSession.initialize(apiKey, serverUrl)
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

    fun updateGameState(roomId: String, board: List<String>, status: String = "PLAYING", winner: String = "") {
        val stateToSave = mapOf(
            "board" to board,
            "status" to status,
            "winner" to winner
        )
        CollabSession.updateState(roomId, stateToSave)
    }

    fun setCollabListener(listener: CollabSession.CollabListener) {
        CollabSession.setListener(listener)
    }

    fun leaveSession() {
        CollabSession.leaveSession()
    }
}
