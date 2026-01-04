package com.example.collab_sdk.network

import com.example.collab_sdk.models.AppRegisterRequest
import com.example.collab_sdk.models.AppRegisterResponse
import com.example.collab_sdk.models.CreateRoomResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface CollabApiService {

    // רישום אפליקציה חדשה (כדי לקבל API Key)
    @POST("api/apps/register")
    suspend fun registerApp(@Body request: AppRegisterRequest): Response<AppRegisterResponse>

    // יצירת חדר חדש (דורש מפתח API בכותרת)
    @POST("api/rooms/create")
    suspend fun createRoom(@Header("x-api-key") apiKey: String): Response<CreateRoomResponse>
}