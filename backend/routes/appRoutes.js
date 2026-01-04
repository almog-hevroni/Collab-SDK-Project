const express = require("express");
const router = express.Router();
const appController = require("../controllers/appController");

router.post("/register", appController.registerApp);

module.exports = router;
