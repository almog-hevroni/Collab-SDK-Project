const Developer = require("../models/Developer");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret_key", {
    expiresIn: "30d",
  });
};

// @desc    Register a new developer
// @route   POST /api/auth/register
// @access  Public
exports.registerDeveloper = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if developer exists
    const developerExists = await Developer.findOne({ email });
    if (developerExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Create developer
    const developer = await Developer.create({
      name,
      email,
      password,
    });

    if (developer) {
      res.status(201).json({
        success: true,
        _id: developer._id,
        name: developer.name,
        email: developer.email,
        token: generateToken(developer._id),
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error registering developer:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Auth developer & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginDeveloper = async (req, res) => {
  try {
    const { email, password } = req.body;

    const developer = await Developer.findOne({ email });

    if (developer && (await developer.matchPassword(password))) {
      res.json({
        success: true,
        _id: developer._id,
        name: developer.name,
        email: developer.email,
        token: generateToken(developer._id),
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get current developer profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const developer = await Developer.findById(req.developer._id).select(
      "-password"
    );
    res.json({ success: true, data: developer });
  } catch (error) {
    console.error("Error fetching me:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
