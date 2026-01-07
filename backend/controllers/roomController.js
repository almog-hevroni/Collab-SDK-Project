// backend/controllers/roomController.js
const Room = require("../models/Room");
const App = require("../models/App");

// @desc    Create a new room
// @route   POST /api/rooms/create
// @access  Public (Protected by API Key middleware)
exports.createRoom = async (req, res) => {
  try {
    const requestingApp = req.appData;

    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();

    const newRoom = new Room({
      roomId: roomId,
      appId: requestingApp._id,
      roomState: [], // Initial state
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

// @desc    Check if room exists
// @route   GET /api/rooms/:roomId
// @access  Public (Protected by API Key middleware)
exports.checkRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    // We also want to ensure the room belongs to the App that is asking (optional security)
    // For now, simple check
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, message: "Room exists", room });
  } catch (error) {
    console.error("Error checking room:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all rooms for a specific App
// @route   GET /api/rooms/app/:appId
// @access  Private (Developer only)
exports.getRoomsByApp = async (req, res) => {
  try {
    const { appId } = req.params;

    // Verify that this app belongs to the logged-in developer
    const app = await App.findById(appId);
    if (!app) {
      return res.status(404).json({ success: false, message: "App not found" });
    }

    if (app.developerId.toString() !== req.developer._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to view these rooms",
        });
    }

    const rooms = await Room.find({ appId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:roomId
// @access  Private (Developer only)
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    // Verify ownership
    const app = await App.findById(room.appId);
    if (app.developerId.toString() !== req.developer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this room",
      });
    }

    await Room.deleteOne({ roomId });

    res.status(200).json({ success: true, message: "Room deleted" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
