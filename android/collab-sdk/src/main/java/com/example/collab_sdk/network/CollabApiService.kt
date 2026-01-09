package com.example.collab_sdk.network

import com.example.collab_sdk.models.CreateRoomResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path

interface CollabApiService {

    @POST("api/rooms/create")
    suspend fun createRoom(@Header("x-api-key") apiKey: String): Response<CreateRoomResponse>

    @GET("api/rooms/{roomId}")
    suspend fun checkRoom(
        @Header("x-api-key") apiKey: String,
        @Path("roomId") roomId: String
    ): Response<Void> // We only care about the 200 vs 404 status code
}
