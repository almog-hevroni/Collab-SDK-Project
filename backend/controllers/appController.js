const App = require("../models/App");
const { v4: uuidv4 } = require("uuid"); // ספרייה ליצירת מזהים ייחודיים

exports.registerApp = async (req, res) => {
  try {
    const { name, email } = req.body;

    // יצירת מפתח API חדש וייחודי
    const newApiKey = uuidv4();

    const newApp = new App({
      name: name,
      ownerEmail: email,
      apiKey: newApiKey,
    });

    await newApp.save();

    res.status(201).json({
      success: true,
      message: "App registered successfully",
      apiKey: newApiKey, // זה הדבר הכי חשוב! המפתח צריך לשמור את זה
      appId: newApp._id,
    });
  } catch (error) {
    console.error("Error registering app:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
