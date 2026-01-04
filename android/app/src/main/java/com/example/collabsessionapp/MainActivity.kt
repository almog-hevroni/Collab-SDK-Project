package com.example.collabsessionapp

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.collab_sdk.CollabSession
import kotlinx.coroutines.launch
import java.util.UUID

class MainActivity : AppCompatActivity(), CollabSession.CollabListener {

    private lateinit var tvStatus: TextView
    private lateinit var boardContainer: FrameLayout
    private lateinit var btnAddNote: Button
    private lateinit var etRoomId: EditText

    private val activeNotes = mutableMapOf<String, View>()
    private var currentRoomId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        tvStatus = findViewById(R.id.tvStatus)
        boardContainer = findViewById(R.id.boardContainer)
        btnAddNote = findViewById(R.id.btnAddNote)
        etRoomId = findViewById(R.id.etRoomId)

        val btnCreate = findViewById<Button>(R.id.btnCreate)
        val btnJoin = findViewById<Button>(R.id.btnJoin)

        btnCreate.setOnClickListener {
            startSession(isNewRoom = true)
        }

        btnJoin.setOnClickListener {
            val roomIdInput = etRoomId.text.toString().trim()
            if (roomIdInput.isNotEmpty()) {
                startSession(isNewRoom = false, roomIdInput = roomIdInput)
            } else {
                Toast.makeText(this, "Please enter Room ID", Toast.LENGTH_SHORT).show()
            }
        }

        btnAddNote.setOnClickListener {
            createNewNote()
        }

        CollabSession.setListener(this)
    }

    private fun startSession(isNewRoom: Boolean, roomIdInput: String? = null) {
        tvStatus.text = "Connecting..."

        lifecycleScope.launch {
            val reg = CollabSession.registerApp("Whiteboard App", "user@demo.com")

            if (reg != null && reg.success) {
                CollabSession.initialize(reg.apiKey)

                if (isNewRoom) {
                    val room = CollabSession.createRoom()
                    if (room != null) {
                        joinTheRoom(room.roomId)
                    } else {
                        updateStatus("Error creating room")
                    }
                } else {
                    joinTheRoom(roomIdInput!!)
                }
            } else {
                updateStatus("Error registering app")
            }
        }
    }

    private fun joinTheRoom(roomId: String) {
        currentRoomId = roomId
        CollabSession.joinRoom(roomId)

        updateStatus("Connected! Room ID: $roomId")
        runOnUiThread {
            etRoomId.setText(roomId) // מציג את ה-ID כדי שיהיה קל להעתיק
            btnAddNote.isEnabled = true
        }
    }

    private fun createNewNote() {
        val noteId = UUID.randomUUID().toString()
        val startX = 100f
        val startY = 300f
        val color = generateRandomColor()

        addNoteViewToBoard(noteId, startX, startY, color)

        val eventData = mapOf(
            "type" to "NOTE_CREATED",
            "id" to noteId,
            "x" to startX,
            "y" to startY,
            "color" to color
        )

        currentRoomId?.let { roomId ->
            CollabSession.sendEvent(roomId, eventData)
        }
    }

    override fun onEventReceived(data: Map<String, Any>) {
        runOnUiThread {
            try {
                val type = data["type"] as? String ?: return@runOnUiThread
                val id = data["id"] as? String ?: return@runOnUiThread

                when (type) {
                    "NOTE_CREATED" -> {
                        if (!activeNotes.containsKey(id)) {
                            val x = (data["x"] as Number).toFloat()
                            val y = (data["y"] as Number).toFloat()
                            val color = (data["color"] as? Number)?.toInt() ?: Color.GRAY
                            addNoteViewToBoard(id, x, y, color)
                        }
                    }
                    "NOTE_MOVED" -> {
                        val x = (data["x"] as Number).toFloat()
                        val y = (data["y"] as Number).toFloat()
                        val noteView = activeNotes[id]
                        noteView?.animate()?.x(x)?.y(y)?.setDuration(0)?.start() // אנימציה חלקה יותר
                    }
                }
            } catch (e: Exception) {
                updateStatus("Error: ${e.message}")
            }
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun addNoteViewToBoard(id: String, x: Float, y: Float, color: Int) {
        val noteView = TextView(this)
        noteView.text = "Note"
        noteView.setBackgroundColor(color)
        noteView.gravity = android.view.Gravity.CENTER
        noteView.setTextColor(Color.WHITE)

        val params = FrameLayout.LayoutParams(200, 200)
        noteView.layoutParams = params
        noteView.x = x
        noteView.y = y

        boardContainer.addView(noteView)
        activeNotes[id] = noteView

        noteView.setOnTouchListener { view, event ->
            when (event.action) {
                MotionEvent.ACTION_MOVE -> {
                    view.x = event.rawX - view.width / 2
                    view.y = event.rawY - view.height * 2

                    currentRoomId?.let { roomId ->
                        val moveData = mapOf(
                            "type" to "NOTE_MOVED",
                            "id" to id,
                            "x" to view.x,
                            "y" to view.y
                        )
                        CollabSession.sendEvent(roomId, moveData)
                    }
                }
            }
            true
        }
    }

    private fun updateStatus(text: String) {
        runOnUiThread { tvStatus.text = text }
    }

    private fun generateRandomColor(): Int {
        val rnd = java.util.Random()
        return Color.rgb(rnd.nextInt(200), rnd.nextInt(200), rnd.nextInt(200))
    }
}