require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// ייבוא הנתיבים (Routes)
const roomRoutes = require("./routes/roomRoutes");
const appRoutes = require("./routes/appRoutes");
const socketHandler = require("./sockets/socketHandler");

const app = express();
app.use(cors());
app.use(express.json());

// --- חיבור ל-MongoDB ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- הגדרת Routes (שכבת הניתוב) ---
app.use("/api/rooms", roomRoutes);
app.use("/api/apps", appRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// --- הפעלת לוגיקת ה-Socket (הפנייה לקובץ החיצוני) ---
socketHandler(io); // <--- הנה הקסם. שורה אחת נקייה.

// מסלול בדיקה כללי
app.get("/", (req, res) => {
  res.send("Server is running with Layered Architecture! 🚀");
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
