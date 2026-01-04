const App = require("../models/App");

const verifyApiKey = async (req, res, next) => {
  // 1. קבלת המפתח מהכותרות (Headers) של הבקשה
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res
      .status(401)
      .json({ success: false, message: "Access Denied: No API Key provided" });
  }

  try {
    // 2. חיפוש האפליקציה במסד הנתונים לפי המפתח
    const app = await App.findOne({ apiKey: apiKey });

    if (!app) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid API Key" });
    }

    // 3. אם נמצא - שומרים את פרטי האפליקציה בבקשה כדי שנשתמש בהם בהמשך
    req.appData = app;

    // 4. ממשיכים לפונקציה הבאה
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = verifyApiKey;
