require("dotenv").config();
const express = require("express");
const http = require("http"); //Imports Node.js's built-in HTTP module.
const { Server } = require("socket.io"); //Destructures the Server class from the socket.io library to enable real-time, bi-directional communication.
const mongoose = require("mongoose");
const cors = require("cors");

//Custom Module Imports
const roomRoutes = require("./routes/roomRoutes");
const appRoutes = require("./routes/appRoutes");
const authRoutes = require("./routes/authRoutes");
const socketHandler = require("./sockets/socketHandler");

//App Initialization & Middleware
const app = express(); //Creates the main Express application instance
app.use(cors()); //Enables CORS for all incoming requests, allowing any client to fetch data from the server
app.use(express.json());

//Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/apps", appRoutes);

//Server Creation
const server = http.createServer(app);

// Socket.io Configuration
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket Logic
socketHandler(io); //This is where the main real-time events (join_room, send_message) are likely defined.

// Basic Routes & Events
app.get("/", (req, res) => {
  res.send("Server is running with Layered Architecture! 🚀");
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

//Server Listening
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
