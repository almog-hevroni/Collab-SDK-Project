// backend/controllers/roomController.js
const Room = require("../models/Room");

exports.createRoom = async (req, res) => {
  try {
    const requestingApp = req.appData;

    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();

    const newRoom = new Room({
      roomId: roomId,
      appId: requestingApp._id,
      notes: [],
    });

    await newRoom.save();

    res.status(201).json({
      success: true,
      roomId: roomId,
      message: "Room created successfully",
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
