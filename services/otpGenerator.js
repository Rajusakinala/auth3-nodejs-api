const otpGenerator = require("otp-generator");

let a = otpGenerator.generate(6, {
  lowerCaseAlphabets: false,
  upperCaseAlphabets: false,
  specialChars: false,
});
console.log("unique Otp : ", a);
