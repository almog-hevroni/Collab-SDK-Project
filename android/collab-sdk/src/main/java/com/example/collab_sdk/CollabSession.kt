package com.example.collab_sdk

import com.example.collab_sdk.internal.NetworkClient
import com.example.collab_sdk.internal.SocketManager
import com.example.collab_sdk.models.AppRegisterResponse
import com.example.collab_sdk.models.CreateRoomResponse
import com.google.gson.Gson

object CollabSession {
    
    private val gson = Gson()
    private lateinit var networkClient: NetworkClient
    private lateinit var socketManager: SocketManager

    private var apiKey: String? = null
    private var listener: CollabListener? = null
    private var isInitialized = false

    interface CollabListener {
        fun onEventReceived(data: Map<String, Any>)
        fun onStateLoaded(state: Any)
    }

    fun initialize(apiKey: String, serverUrl: String) {
        this.apiKey = apiKey
        this.networkClient = NetworkClient(serverUrl)
        this.socketManager = SocketManager(serverUrl, gson)
        this.isInitialized = true
        
        // If listener was set before initialization, re-set it to the new socketManager
        listener?.let { socketManager.setListener(it) }
    }

    fun setListener(collabListener: CollabListener) {
        this.listener = collabListener
        if (isInitialized) {
            socketManager.setListener(collabListener)
        }
    }

    // --- Networking Delegates ---

    suspend fun registerApp(appName: String, email: String): AppRegisterResponse? {
        if (!isInitialized) return null
        return networkClient.registerApp(appName, email)
    }

    suspend fun createRoom(): CreateRoomResponse? {
        if (!isInitialized || apiKey == null) return null
        return networkClient.createRoom(apiKey!!)
    }

    suspend fun checkRoom(roomId: String): Boolean {
        if (!isInitialized || apiKey == null) return false
        return networkClient.checkRoom(apiKey!!, roomId)
    }

    // --- Socket Delegates ---

    fun joinRoom(roomId: String) {
        if (isInitialized) {
            socketManager.connect(roomId, listener)
        }
    }

    fun sendEvent(roomId: String, eventData: Map<String, Any>) {
        if (isInitialized) {
            socketManager.sendEvent(roomId, eventData)
        }
    }

    fun updateState(roomId: String, state: Any) {
        if (isInitialized) {
            socketManager.updateState(roomId, state)
        }
    }

    fun isSocketConnected(): Boolean = isInitialized && socketManager.isConnected()
}
