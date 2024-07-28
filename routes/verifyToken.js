const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const accessToken = req.header("accessToken");
  // const { accessToken } = req.body;
  // console.log("token", token);
  if (!accessToken)
    return res.status(401).send("accessToken not found in headers");
  try {
    const verifiedUser = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.user = verifiedUser;
    // above verifiedUser will be payload {_id:"", iat:""}
    next();
  } catch (err) {
    // res.status(400).send("Token recevied, but Invalid");
    res.status(403).send("accessToken expired");
  }
}
module.exports = auth;
