const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  id: { type: String, required: true },
  content: { type: String, default: "" },
  color: { type: String, default: "#FFFF88" },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  appId: { type: mongoose.Schema.Types.ObjectId, ref: "App", required: true },

  notes: [NoteSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Room", RoomSchema);
