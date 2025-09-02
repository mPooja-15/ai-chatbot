const authValidation = require('./authValidation');
const chatValidation = require('./chatValidation');
const userValidation = require('./userValidation');

module.exports = {
  ...authValidation,
  ...chatValidation,
  ...userValidation
};
