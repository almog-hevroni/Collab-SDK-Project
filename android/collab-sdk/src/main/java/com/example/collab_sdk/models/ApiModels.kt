package com.example.collab_sdk.models

data class AppRegisterRequest(
    val name: String,
    val email: String
)

data class AppRegisterResponse(
    val success: Boolean,
    val message: String,
    val apiKey: String,
    val appId: String
)

data class CreateRoomResponse(
    val success: Boolean,
    val roomId: String,
    val message: String
)