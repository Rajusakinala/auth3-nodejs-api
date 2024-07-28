const mongoose = require("mongoose");
const userDetailsSchema = new mongoose.Schema({}, { strict: false });
module.exports = mongoose.model(
  "UserDetails",
  userDetailsSchema,
  "UserDetails"
);
