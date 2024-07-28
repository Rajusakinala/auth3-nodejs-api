const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
mongoose.set("strictQuery", true);
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }, () => {
  console.log("DB Connected");
});
app.use(express.json());

const authRoute = require("./routes/auth");
app.use("/api/v1/user", authRoute);

const detailsRoute = require("./routes/details");
app.use("/api/v1/user-details", detailsRoute);

const postsRoute = require("./routes/posts");
app.use("/api/v1/posts", postsRoute);

app.get("/", (req, res) => {
  res.send("Home route");
});

app.listen(process.env.PORT, () => console.log("server running on port 4000"));
