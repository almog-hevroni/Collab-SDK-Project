# Android Library (CollabSDK)

A Kotlin library for integrating real-time features.

## Installation

Add the library to your `build.gradle.kts` dependencies (once published):

```kotlin
implementation("com.example.collab:collab-sdk:1.0.0")
```

## Usage

### 1. Initialize the SDK

Initialize the SDK in your Application class or main Activity.

```kotlin
val sdk = CollabSessionSDK.getInstance()
sdk.initialize(context, "YOUR_API_KEY")
```

### 2. Connect to a Session

```kotlin
sdk.joinSession("room_id_123") { success, message ->
    if (success) {
        println("Connected!")
    }
}
```

### 3. Send & Receive Messages

```kotlin
// Send
sdk.sendMessage("Hello World")

// Listen
sdk.onMessageReceived = { message ->
    println("New message: $message")
}
```
