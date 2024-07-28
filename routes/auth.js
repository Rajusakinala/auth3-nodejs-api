const router = require("express").Router();
const User = require("../model/User");
const {
  registerValidation,
  loginValidation,
  passwordResetValidation,
} = require("../validation/validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const Details = require("../model/Details");
const multer = require("multer");
const Avatar = require("../model/Avatar");
const sharp = require("sharp");

router.post("/register", async (req, res) => {
  console.log("@@req.body", req.body);
  // const validation = new joi.ValidationError(req.body, schema);
  try {
    // Register validation
    const { error } = registerValidation(req.body);
    if (error) {
      // console.log(error);
      return res.status(400).send(error.details[0].message);
    } else {
      // Checking if user is already in database or not
      // const emailExist = await User.aggregate([
      //   { $match: { email: req.body.email } },
      // ]);
      const emailExist = await User.findOne({ email: req.body.email });
      if (emailExist) {
        return res.status(400).send("email already registered");
      }
      // if email not exist in database then moves to next

      // Hashing password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Create a new user
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        // password: req.body.password,
        number: req.body.number,
        password: hashedPassword,
      });
      const savedUser = await user.save();
      res.status(200).send(savedUser);
      // res.send("Successfully registered");
    }
  } catch (err) {
    console.log("err", err);
    res.status(400).send(err);
  }
});

// forgot password route
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    // console.log("email", email);
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("Email does not registered");
    } else {
      // console.log("user", user);
      // // generate otp
      let otp = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      // console.log("otp", otp);
      // return res.status(200).send({ email, otp });

      // //send otp to user.email or req.body.email. Show them otp sent to email successfully
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "sakinala.raju1@gmail.com",
          pass: "vfjhmklfofrnsywk",
        },
      });

      var mailOptions = {
        from: "sakinala.raju1@gmail.com",
        to: `${email}`,
        subject:
          "please use this otp for reset your password. And this will expires in 2min",
        text: `${otp}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("error : ", error);
        } else {
          console.log("Email sent : ", info.response);
          //send same otp to clint in res
          return res.status(200).send({ email, otp });

          // return res.status(200).json({ otp });
        }
      });

      // //send same otp to clint in res
      // return res.status(200).send({ otp: otp });
    }
  } catch (err) {
    res.send(err);
  }
});

// reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("email, password", email, password);
    const { error } = passwordResetValidation(req.body);
    if (error) {
      // validation error
      return res.status(400).send(error.details[0].message);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const updatedUser = await User.updateOne(
      { email: req.body.email },
      { $set: { password: hashedPassword } }
    );

    return res.status(200).send(updatedUser);
  } catch (err) {}
});

// login route
let refreshTokens = [];

router.post("/login", async (req, res) => {
  try {
    // login validation
    const { error } = loginValidation(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    // Checking if user in database with email
    let user = await User.aggregate([{ $match: { email: req.body.email } }]);
    user = user[0];
    // const user = await User.findOne({ email: req.body.email });
    // console.log("##user", user);
    // res.send(user);
    if (!user) {
      return res.status(400).send("Email doesn't registered");
    }

    // Checking password matched or not
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) return res.status(400).send("Invalid password");

    // bellow one line shold be commented for jwt
    // res.send({ userName: user.name, email: user.email, user_id: user._id });

    // Create token and assign a token to header

    // const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    // // console.log("token", token);
    // res.header("auth-token", token).status(200).send(token);

    // JWT athentication

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10s" }
    );
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "25s" }
    );
    refreshTokens.push(refreshToken);

    // res.header("accessToken", accessToken);
    // res.header("refreshToken", refreshToken);

    // res.header("auth-token", refreshToken).status(200).send(token);
    // res.header("auth-token", accessToken);
    // res.header("auth-token", refreshToken);
    // res.status(200).send(accessToken)

    // return res.status(200).json({ accessToken, refreshToken });
    res.json({
      name: user.name,
      email: user.email,
      number: user.number,
      user_id: user._id,
      accessToken,
      refreshToken,
    });

    // res.send("logged in successfully");
  } catch (err) {
    res.send(err);
  }
});

// Update user name
router.patch("/update", async (req, res) => {
  const updatedUser = await User.updateOne(
    { _id: req.body._id },
    { $set: { name: req.body.name } }
    // { $set: { ...req.body } }
  );
  //updating name on Detaols collection
  const updatedUserName = await Details.updateOne(
    { userId: req.body._id },
    { $set: { name: req.body.name } }
  );

  res.status(200).send(updatedUser);
});

// Create new access token with a refresh token
router.post("/tokenRefresh", async (req, res) => {
  // const { refreshToken } = req.body;
  const refreshToken = req.header("refreshToken");
  // console.log("@@refreshToken : ", refreshToken);

  // if we did not get refresh token
  if (!refreshToken) {
    return res.status(401).json({ error: "refreshToken not found in headers" });
  }
  // if refreshToken does not exist in refreshTokens Array
  if (!refreshTokens.includes(refreshToken)) {
    return res
      .status(403)
      .json({ error: "refreshToken not belogs to this instance" });
  }
  try {
    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const { _id } = user;
    const accessToken = await jwt.sign(
      { _id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10s" }
    );
    res.json({ accessToken });
  } catch (error) {
    refreshTokens = [];
    return res.status(403).send("refreshToken expired");
  }
});

router.delete("/logout", async (req, res) => {
  // clearing the this instance
  refreshTokens = [];
  return res.status(202).json({ msg: "your logged out" });
  // return res.status(204).send("your logged out"); // this 204 response won't send anything
});

const upload = multer();
router.post(
  "/profile-pic",
  upload.single("avatar"),
  async (req, res) => {
    const email = req.body.email;
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    // console.log("@@requests", req.body, req.file, req.file.buffer, buffer);
    // const avatar = req.file.buffer; // original Buffer
    const avatar = buffer; // compressed Buffer
    const originalname = req.file.originalname;
    const imageResult = await Avatar.findOne({
      email,
    });

    if (imageResult) {
      const updatedAvatar = await Avatar.updateOne(
        { email: req.body.email },
        { $set: { avatar, originalname } }
      );
      res.send("successful-2");
    } else {
      const img = new Avatar({ ...req.body, avatar, originalname });
      const savedImage = await img.save();
      res.send("successful-2");
    }
  },
  (error, req, res, next) => {
    res.status(404).send({ error: error.message });
  }
);

router.get("/profile-pic", async (req, res) => {
  const email = req.query.email;
  console.log("email", email);
  const imageResult = await Avatar.findOne({
    email,
  });
  //   console.log("imageResult", imageResult);
  res.send(imageResult);
});

module.exports = router;
