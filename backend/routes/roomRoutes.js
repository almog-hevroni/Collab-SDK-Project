const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const verifyApiKey = require("../middleware/authMiddleware"); // <--- ייבוא

router.post("/create", verifyApiKey, roomController.createRoom);
router.get("/:roomId", verifyApiKey, roomController.checkRoom);

module.exports = router;
