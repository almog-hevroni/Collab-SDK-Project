const App = require("../models/App");
const { v4: uuidv4 } = require("uuid");

// @desc    Register a new app
// @route   POST /api/apps/register
// @access  Private (Developer only)
exports.registerApp = async (req, res) => {
  try {
    const { name } = req.body;

    // Use the logged-in developer's email
    const email = req.developer.email;
    const developerId = req.developer._id;

    const newApiKey = uuidv4();

    const newApp = new App({
      name: name,
      ownerEmail: email,
      developerId: developerId,
      apiKey: newApiKey,
    });

    await newApp.save();

    res.status(201).json({
      success: true,
      message: "App registered successfully",
      apiKey: newApiKey,
      appId: newApp._id,
      app: newApp,
    });
  } catch (error) {
    console.error("Error registering app:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all apps for the logged-in developer
// @route   GET /api/apps/my-apps
// @access  Private (Developer only)
exports.getMyApps = async (req, res) => {
  try {
    const apps = await App.find({ developerId: req.developer._id });

    res.status(200).json({
      success: true,
      count: apps.length,
      data: apps,
    });
  } catch (error) {
    console.error("Error fetching apps:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
