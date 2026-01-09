# Android Library (CollabSDK)

A Kotlin library for integrating real-time features.

## Installation

### Step 1. Add the JitPack repository

Add this to your `settings.gradle.kts` file:

```kotlin
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
    }
}
```

### Step 2. Add the dependency

Add the library to your app's `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.github.almog-hevroni:Collab-SDK-Project:v1.0.2")
}
```

## Usage

### 1. Initialize the SDK

Initialize the SDK in your Application class or main Activity.

**Note:** You must provide the base URL of your backend server.

```kotlin
// Initialize with your API Key and Server URL
CollabSession.initialize("YOUR_API_KEY", "http://your-server-ip:3000/")
```

### 2. Connect to a Session

```kotlin
CollabSession.joinRoom("room_id_123")
```

### 3. Send & Receive Events

To receive events, implement the `CollabListener` interface:

```kotlin
val listener = object : CollabSession.CollabListener {
    override fun onEventReceived(data: Map<String, Any>) {
        println("New event: $data")
    }

    override fun onStateLoaded(state: Any) {
        println("State loaded: $state")
    }
}

CollabSession.setListener(listener)
```

To send an event:

```kotlin
val eventData = mapOf("message" to "Hello World")
CollabSession.sendEvent("room_id_123", eventData)
```
