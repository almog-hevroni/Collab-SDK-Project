const jwt = require("jsonwebtoken");
const Developer = require("../models/Developer");
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

const protectDeveloper = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_secret_key"
      );

      // Get developer from the token
      req.developer = await Developer.findById(decoded.id).select("-password");

      if (!req.developer) {
        return res
          .status(401)
          .json({ success: false, message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: "Not authorized" });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

module.exports = { verifyApiKey, protectDeveloper };
