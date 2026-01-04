package com.example.collab_sdk.network

import com.example.collab_sdk.models.AppRegisterRequest
import com.example.collab_sdk.models.AppRegisterResponse
import com.example.collab_sdk.models.CreateRoomResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface CollabApiService {

    @POST("api/apps/register")
    suspend fun registerApp(@Body request: AppRegisterRequest): Response<AppRegisterResponse>

    @POST("api/rooms/create")
    suspend fun createRoom(@Header("x-api-key") apiKey: String): Response<CreateRoomResponse>
}