// backend/controllers/roomController.js
const Room = require("../models/Room");
const { v4: uuidv4 } = require("uuid");

// פונקציה ליצירת חדר חדש
exports.createRoom = async (req, res) => {
  try {
    // המאבטח (Middleware) כבר מצא את האפליקציה ושם אותה ב-req.appData
    const requestingApp = req.appData;

    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();

    const newRoom = new Room({
      roomId: roomId,
      appId: requestingApp._id, // <--- הנה הקישור החשוב!
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
