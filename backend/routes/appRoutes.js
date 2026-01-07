const express = require("express");
const router = express.Router();
const appController = require("../controllers/appController");
const { protectDeveloper } = require("../middleware/authMiddleware");

// All app routes should be protected by developer login
router.post("/register", protectDeveloper, appController.registerApp);
router.get("/my-apps", protectDeveloper, appController.getMyApps);

module.exports = router;
