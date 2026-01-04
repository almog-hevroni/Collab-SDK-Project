package com.example.collab_sdk

import android.util.Log
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.example.collab_sdk.models.AppRegisterRequest
import com.example.collab_sdk.models.AppRegisterResponse
import com.example.collab_sdk.models.CreateRoomResponse
import com.example.collab_sdk.network.CollabApiService
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.net.URISyntaxException

object CollabSession {
    private const val BASE_URL = "http://192.168.1.28:3000/"
    private const val TAG = "CollabSDK"

    private var apiService: CollabApiService? = null
    private var apiKey: String? = null
    private var mSocket: Socket? = null

    private val gson = Gson()

    // --- (Generic Listener) ---
    interface CollabListener {
        fun onEventReceived(data: Map<String, Any>)
    }
    private var listener: CollabListener? = null

    fun initialize(apiKey: String) {
        this.apiKey = apiKey
        setupRetrofit()
        setupSocket()
        Log.d(TAG, "SDK Initialized. Ready to connect.")
    }

    fun setListener(collabListener: CollabListener) {
        this.listener = collabListener
    }

    private fun setupRetrofit() {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        apiService = retrofit.create(CollabApiService::class.java)
    }

    private fun setupSocket() {
        try {
            mSocket = IO.socket(BASE_URL)
        } catch (e: URISyntaxException) {
            Log.e(TAG, "Socket URI Error: ${e.message}")
        }
    }

    fun joinRoom(roomId: String) {
        if (mSocket?.connected() == false) {
            mSocket?.connect()
        }
        mSocket?.on(Socket.EVENT_CONNECT) {
            Log.d(TAG, "Socket Connected! Joining room: $roomId")
            mSocket?.emit("join_room", roomId)
        }

        mSocket?.on("collab_event") { args ->
            if (args.isNotEmpty()) {
                val data = args[0]
                Log.d(TAG, "Received raw event: $data")

                try {
                    val type = object : TypeToken<Map<String, Any>>() {}.type
                    val mapData: Map<String, Any> = gson.fromJson(data.toString(), type)

                    listener?.onEventReceived(mapData)
                } catch (e: Exception) {
                    Log.e(TAG, "Error parsing event data: ${e.message}")
                }
            }
        }
    }

    // Sending Events
    fun sendEvent(roomId: String, eventData: Map<String, Any>) {
        if (mSocket?.connected() == false) {
            Log.e(TAG, "Cannot send event - Socket not connected")
            return
        }

        val updateData = JSONObject()
        try {
            updateData.put("roomId", roomId)

            val payloadJson = JSONObject(gson.toJson(eventData))
            updateData.put("payload", payloadJson)

            mSocket?.emit("collab_event", updateData)
            Log.d(TAG, "Event sent: $eventData")

        } catch (e: Exception) {
            Log.e(TAG, "Error sending event: ${e.message}")
        }
    }

    fun isSocketConnected(): Boolean {
        return mSocket?.connected() == true
    }

    suspend fun registerApp(appName: String, email: String): AppRegisterResponse? {
        if (apiService == null) setupRetrofit()
        return try {
            val response = apiService?.registerApp(AppRegisterRequest(appName, email))
            if (response != null && response.isSuccessful) {
                response.body()
            } else {
                Log.e(TAG, "Register failed: ${response?.errorBody()?.string()}")
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Register Exception: ${e.message}")
            null
        }
    }

    suspend fun createRoom(): CreateRoomResponse? {
        if (apiKey == null) {
            Log.e(TAG, "Cannot create room: API Key missing. Call initialize() first.")
            return null
        }
        return try {
            val response = apiService?.createRoom(apiKey!!)
            if (response != null && response.isSuccessful) {
                response.body()
            } else {
                Log.e(TAG, "Create Room failed: ${response?.errorBody()?.string()}")
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Create Room Exception: ${e.message}")
            null
        }
    }
}