package com.example.collab_sdk.internal

import com.example.collab_sdk.models.AppRegisterRequest
import com.example.collab_sdk.models.AppRegisterResponse
import com.example.collab_sdk.models.CreateRoomResponse
import com.example.collab_sdk.network.CollabApiService
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

internal class NetworkClient(baseUrl: String) {

    private val apiService: CollabApiService

    init {
        val retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        apiService = retrofit.create(CollabApiService::class.java)
    }

    suspend fun registerApp(appName: String, email: String): AppRegisterResponse? {
        return try {
            val response = apiService.registerApp(AppRegisterRequest(appName, email))
            if (response.isSuccessful) response.body() else null
        } catch (e: Exception) {
            null
        }
    }

    suspend fun createRoom(apiKey: String): CreateRoomResponse? {
        return try {
            val response = apiService.createRoom(apiKey)
            if (response.isSuccessful) response.body() else null
        } catch (e: Exception) {
            null
        }
    }

    suspend fun checkRoom(apiKey: String, roomId: String): Boolean {
        return try {
            val response = apiService.checkRoom(apiKey, roomId)
            // If response code is 200, room exists. If 404, it doesn't.
            response.isSuccessful
        } catch (e: Exception) {
            false
        }
    }
}