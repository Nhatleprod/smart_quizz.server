// src/middlewares/index.js
const { handleValidationErrors } = require("./validation.middleware");
const {
  validateCreateAccount,
  validateUpdateAccount,
  validateAccountId,
  validateChangePassword,
  validateLogin,
  validateCheckAccount,
  validateResetPassword,
} = require("./validation.middleware");

const {
  authenticateById,
  authenticateByCredentials,
  checkRole,
} = require("./auth.middleware");

const { hashPassword } = require("./hashPassword.middleware");
const { handleError, createError } = require("./error.middleware");

// Export tất cả các middlewares
module.exports = {
  // Validation middlewares
  validateCreateAccount,
  validateUpdateAccount,
  validateAccountId,
  validateChangePassword,
  validateLogin,
  validateCheckAccount,
  validateResetPassword,
  handleValidationErrors,

  // Auth middlewares
  authenticateById,
  authenticateByCredentials,
  checkRole,

  // Other middlewares
  hashPassword,
  errorHandler: handleError,
  createError,
};
