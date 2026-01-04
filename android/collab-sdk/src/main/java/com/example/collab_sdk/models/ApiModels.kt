package com.example.collab_sdk.models

// בקשת רישום אפליקציה
data class AppRegisterRequest(
    val name: String,
    val email: String
)

// תשובה לרישום
data class AppRegisterResponse(
    val success: Boolean,
    val message: String,
    val apiKey: String,
    val appId: String
)

// תשובה ליצירת חדר
data class CreateRoomResponse(
    val success: Boolean,
    val roomId: String,
    val message: String
)