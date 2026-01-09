package com.example.collabsessionapp.data

import android.content.Context
import android.content.SharedPreferences
import com.example.collab_sdk.CollabSession
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GameRepository(private val context: Context) {

    // Removed SharedPreferences usage as API Key is now hardcoded/constants
    // private val prefs: SharedPreferences = context.getSharedPreferences("CollabPrefs", Context.MODE_PRIVATE)

    // Ensure SDK is initialized with a valid API Key
    suspend fun initializeSdk(): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                // Hardcoded API Key from Developer Portal
                // In a real production app, this should be in BuildConfig or secure storage
                val apiKey = "093912e3-312c-4c18-8949-7a3878ec4f19"
                
                // TODO: Replace with your computer's local IP address if running on a physical device.
                // Keep the port :3000 if that's what your backend uses.
                val serverUrl = "http://192.168.1.31:3000/"

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
