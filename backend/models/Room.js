const mongoose = require("mongoose");

// הגדרת המבנה של פתק בודד
const NoteSchema = new mongoose.Schema({
  id: { type: String, required: true }, // מזהה ייחודי לפתק (UUID שנכין באנדרואיד)
  content: { type: String, default: "" },
  color: { type: String, default: "#FFFF88" }, // צהוב כברירת מחדל
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

// הגדרת המבנה של חדר
const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  appId: { type: mongoose.Schema.Types.ObjectId, ref: "App", required: true },

  notes: [NoteSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Room", RoomSchema);
