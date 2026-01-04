const App = require("../models/App");

const verifyApiKey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res
      .status(401)
      .json({ success: false, message: "Access Denied: No API Key provided" });
  }

  try {
    //Find the app in the database by the API key
    const app = await App.findOne({ apiKey: apiKey });

    if (!app) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid API Key" });
    }

    //Save the app data to the request object
    req.appData = app;

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = verifyApiKey;
