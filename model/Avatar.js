const mongoose = require("mongoose");
const Avatar = new mongoose.Schema(
  { avatar: { type: Buffer } },
  { strict: false }
);
module.exports = mongoose.model("Avatar", Avatar, "Avatar");
