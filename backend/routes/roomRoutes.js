const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const verifyApiKey = require("../middleware/authMiddleware").verifyApiKey; // For SDK access
const { protectDeveloper } = require("../middleware/authMiddleware"); // For Portal access

// SDK Routes (Protected by API Key)
router.post("/create", verifyApiKey, roomController.createRoom);
router.get("/:roomId", verifyApiKey, roomController.checkRoom);

// Portal Routes (Protected by Developer Token)
router.get("/app/:appId", protectDeveloper, roomController.getRoomsByApp);
router.delete("/:roomId", protectDeveloper, roomController.deleteRoom);

module.exports = router;
