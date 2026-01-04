const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const verifyApiKey = require("../middleware/authMiddleware"); // <--- ייבוא

// הוספת verifyApiKey לפני createRoom
router.post("/create", verifyApiKey, roomController.createRoom);

module.exports = router;
