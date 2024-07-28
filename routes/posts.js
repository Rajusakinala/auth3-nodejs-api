const router = require("express").Router();
const verify = require("./verifyToken");

router.get("/public", (req, res) => {
  // router.get("/", (req, res) => {
  console.log("req", req.user);
  // res.send(req.user._id);
  res.json({
    posts: {
      title: "My Public post",
      description: "This is Public data, accessable with out access token",
    },
  });
});
router.get("/private", verify, (req, res) => {
  // router.get("/", (req, res) => {
  console.log("req", req.user);
  // res.send(req.user._id);
  res.json({
    posts: {
      title: "My private post",
      description: "This is private data, accessable only through access token",
    },
  });
});

module.exports = router;
