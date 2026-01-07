package com.example.collab_sdk

import com.example.collab_sdk.internal.NetworkClient
import com.example.collab_sdk.internal.SocketManager
import com.example.collab_sdk.models.AppRegisterResponse
import com.example.collab_sdk.models.CreateRoomResponse
import com.google.gson.Gson

object CollabSession {
    // IMPORTANT: Ensure this IP matches your local backend server IP
    private const val BASE_URL = "http://192.168.1.28:3000/"

    private val gson = Gson()
    private val networkClient = NetworkClient(BASE_URL)
    private val socketManager = SocketManager(BASE_URL, gson)

    private var apiKey: String? = null
    private var listener: CollabListener? = null

    interface CollabListener {
        fun onEventReceived(data: Map<String, Any>)
        fun onStateLoaded(state: Any)
    }

    fun initialize(apiKey: String) {
        this.apiKey = apiKey
    }

    fun setListener(collabListener: CollabListener) {
        this.listener = collabListener
        // Pass listener to socket manager so it can dispatch events
        socketManager.setListener(collabListener)
    }

    // --- Networking Delegates ---

    suspend fun registerApp(appName: String, email: String): AppRegisterResponse? {
        return networkClient.registerApp(appName, email)
    }

    suspend fun createRoom(): CreateRoomResponse? {
        if (apiKey == null) return null
        return networkClient.createRoom(apiKey!!)
    }

    suspend fun checkRoom(roomId: String): Boolean {
        if (apiKey == null) return false
        return networkClient.checkRoom(apiKey!!, roomId)
    }

    // --- Socket Delegates ---

    fun joinRoom(roomId: String) {
        socketManager.connect(roomId, listener)
    }

    fun sendEvent(roomId: String, eventData: Map<String, Any>) {
        socketManager.sendEvent(roomId, eventData)
    }

    fun updateState(roomId: String, state: Any) {
        socketManager.updateState(roomId, state)
    }

    fun isSocketConnected(): Boolean = socketManager.isConnected()
}