const Joi = require("joi");

// Register validation
const registerValidation = (data) => {
  const registerSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().min(6).required().email(),
    number: Joi.string().min(6).max(15).required(),
    password: Joi.string().min(6).required(),
  });
  return registerSchema.validate(data);
};
// Login validation
const loginValidation = (data) => {
  const loginSchema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  });
  return loginSchema.validate(data);
};
const passwordResetValidation = (data) => {
  const passwordResetSchema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  });
  return passwordResetSchema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.passwordResetValidation = passwordResetValidation;
