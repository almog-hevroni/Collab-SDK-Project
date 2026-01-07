const express = require("express");
const router = express.Router();
const {
  registerDeveloper,
  loginDeveloper,
  getMe,
} = require("../controllers/authController");
const { protectDeveloper } = require("../middleware/authMiddleware");

router.post("/register", registerDeveloper);
router.post("/login", loginDeveloper);
router.get("/me", protectDeveloper, getMe);

module.exports = router;
