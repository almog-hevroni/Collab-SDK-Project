package com.example.collabsessionapp

import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.GridLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    // Use 'by viewModels()' for automatic lifecycle handling
    private val viewModel: GameViewModel by viewModels()

    // --- UI Variables ---
    private lateinit var layoutStartScreen: LinearLayout
    private lateinit var layoutGame: LinearLayout
    private lateinit var tvStatus: TextView
    private lateinit var tvRoomCode: TextView
    private lateinit var gridLayout: GridLayout
    private lateinit var etRoomId: EditText
    private val buttons = arrayOfNulls<Button>(9)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initializeViews()
        setupListeners()
        setupObservers()
    }

    private fun initializeViews() {
        layoutStartScreen = findViewById(R.id.layoutStartScreen)
        layoutGame = findViewById(R.id.layoutGame)
        tvStatus = findViewById(R.id.tvStatus)
        tvRoomCode = findViewById(R.id.tvRoomCode)
        etRoomId = findViewById(R.id.etRoomId)
        gridLayout = findViewById(R.id.ticTacToeGrid)

        setupGrid()
    }

    private fun setupGrid() {
        gridLayout.removeAllViews()
        for (i in 0 until 9) {
            val btn = Button(this)
            btn.text = ""
            btn.textSize = 32f
            btn.setBackgroundColor(Color.LTGRAY)

            val params = GridLayout.LayoutParams()
            params.width = 0
            params.height = 0
            params.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
            params.rowSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
            params.setMargins(8, 8, 8, 8)
            btn.layoutParams = params

            btn.setOnClickListener { viewModel.onCellClicked(i) }

            gridLayout.addView(btn)
            buttons[i] = btn
        }
    }

    private fun setupListeners() {
        findViewById<Button>(R.id.btnCreate).setOnClickListener {
            viewModel.createSession()
        }

        findViewById<Button>(R.id.btnJoin).setOnClickListener {
            val input = etRoomId.text.toString().trim()
            viewModel.joinSession(input)
        }

        findViewById<Button>(R.id.btnExit).setOnClickListener {
            viewModel.exitGame()
        }
    }

    private fun setupObservers() {
        // 1. Board Updates
        viewModel.boardState.observe(this) { board ->
            for (i in 0 until 9) {
                buttons[i]?.text = board[i]
                if (board[i] == "X") buttons[i]?.setTextColor(Color.RED)
                else if (board[i] == "O") buttons[i]?.setTextColor(Color.BLUE)
            }
        }

        // 2. Game Status Text
        viewModel.statusText.observe(this) { status ->
            tvStatus.text = status
        }

        // 3. Room Code Display
        viewModel.roomCode.observe(this) { code ->
            tvRoomCode.text = code
        }

        // 4. Winning Line Highlighting
        viewModel.winningLine.observe(this) { indices ->
            if (indices != null) {
                for (index in indices) {
                    buttons[index]?.setBackgroundColor(Color.GREEN)
                }
            } else {
                // Reset colors if null (new game)
                for (btn in buttons) {
                    btn?.setBackgroundColor(Color.LTGRAY)
                }
            }
        }

        // 5. Screen Navigation (Lobby vs Game)
        viewModel.gameState.observe(this) { state ->
            if (state == GameViewModel.GameState.GAME) {
                layoutStartScreen.visibility = View.GONE
                layoutGame.visibility = View.VISIBLE
                etRoomId.setText("") // Clear input
            } else {
                layoutStartScreen.visibility = View.VISIBLE
                layoutGame.visibility = View.GONE
                // Reset board UI immediately for good UX
                for (btn in buttons) {
                    btn?.text = ""
                    btn?.setBackgroundColor(Color.LTGRAY)
                }
            }
        }

        // 6. One-time Toast Messages
        lifecycleScope.launch {
            viewModel.toastEvent.collect { message ->
                Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
            }
        }
    }
}