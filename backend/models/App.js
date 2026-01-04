const mongoose = require("mongoose");

const AppSchema = new mongoose.Schema({
  name: { type: String, required: true }, // שם האפליקציה (למשל: Chess Game)
  ownerEmail: { type: String, required: true }, // המייל של המפתח
  apiKey: { type: String, required: true, unique: true }, // המפתח הסודי (ה"תעודה")
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("App", AppSchema);
