const router = require("express").Router();
const Details = require("../model/Details");
const User = require("../model/User");

router.post("/", async (req, res) => {
  //   console.log("req.body", req.body);
  const userExist = await Details.findOne({ userId: req.body.userId });
  if (userExist) {
    const updatedDetails = await Details.updateOne(
      { userId: req.body.userId },
      { $set: { ...req.body } }
    );
    return res.status(200).send(updatedDetails);
  }
  const userDetails = new Details({ ...req.body });
  const savedDetails = await userDetails.save();
  res.status(200).send(savedDetails);
});
router.post("/getDetails", async (req, res) => {
  //   console.log("req.body", req.body);
  const userDetails = await Details.findOne({ userId: req.body.userId });
  return res.status(200).send(userDetails);
});

module.exports = router;
