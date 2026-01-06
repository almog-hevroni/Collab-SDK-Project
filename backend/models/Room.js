const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  appId: { type: mongoose.Schema.Types.ObjectId, ref: "App", required: true },

  roomState: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },

  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Room", RoomSchema);
