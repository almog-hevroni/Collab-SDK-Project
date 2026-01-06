package com.example.collab_sdk.internal

import android.util.Log
import com.example.collab_sdk.CollabSession
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONArray
import org.json.JSONObject
import java.net.URISyntaxException

internal class SocketManager(private val baseUrl: String, private val gson: Gson) {

    private var socket: Socket? = null
    private var listener: CollabSession.CollabListener? = null
    private val TAG = "SocketManager"

    fun connect(roomId: String, listener: CollabSession.CollabListener?) {
        this.listener = listener
        try {
            socket = IO.socket(baseUrl)
        } catch (e: URISyntaxException) {
            Log.e(TAG, "Socket URI Error: ${e.message}")
            return
        }

        socket?.on(Socket.EVENT_CONNECT) {
            Log.d(TAG, "Socket Connected! Joining room: $roomId")
            socket?.emit("join_room", roomId)
        }

        socket?.on("initial_state") { args ->
            if (args.isNotEmpty()) {
                val rawData = args[0]
                try {
                    val state = gson.fromJson(rawData.toString(), Any::class.java)
                    this.listener?.onStateLoaded(state)
                } catch (e: Exception) {
                    Log.e(TAG, "Error parsing initial state: ${e.message}")
                }
            }
        }

        socket?.on("collab_event") { args ->
            if (args.isNotEmpty()) {
                val data = args[0]
                try {
                    val type = object : TypeToken<Map<String, Any>>() {}.type
                    val mapData: Map<String, Any> = gson.fromJson(data.toString(), type)
                    this.listener?.onEventReceived(mapData)
                } catch (e: Exception) {
                    Log.e(TAG, "Error parsing event data: ${e.message}")
                }
            }
        }

        if (socket?.connected() == false) {
            socket?.connect()
        }
    }

    fun sendEvent(roomId: String, eventData: Map<String, Any>) {
        if (socket?.connected() == false) return

        val updateData = JSONObject()
        try {
            updateData.put("roomId", roomId)
            val payloadJson = JSONObject(gson.toJson(eventData))
            updateData.put("payload", payloadJson)
            socket?.emit("collab_event", updateData)
        } catch (e: Exception) {
            Log.e(TAG, "Error sending event: ${e.message}")
        }
    }

    fun updateState(roomId: String, state: Any) {
        if (socket?.connected() == false) return

        try {
            val wrapper = JSONObject()
            wrapper.put("roomId", roomId)
            val jsonString = gson.toJson(state)

            if (jsonString.trim().startsWith("[")) {
                wrapper.put("roomState", JSONArray(jsonString))
            } else {
                wrapper.put("roomState", JSONObject(jsonString))
            }

            socket?.emit("update_state", wrapper)
        } catch (e: Exception) {
            Log.e(TAG, "Error sending state update: ${e.message}")
        }
    }

    fun isConnected(): Boolean = socket?.connected() == true

    fun setListener(listener: CollabSession.CollabListener) {
        this.listener = listener
    }
}