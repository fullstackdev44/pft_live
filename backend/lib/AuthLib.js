'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwt_config = require('../auth/config/jwt');

const AuthLib = (function() {

  let exports = {};

  exports.generateToken = function(user, callback) {

    const file_name = path.join(__dirname, '../auth/config') + '/private.key';
    const privateKey = fs.readFileSync(file_name, 'utf8');

    // Token generation
    const token_payload = {
      _id: user._id,
      full_name: user.full_name,
      avatar_color: user.avatar_color,
      avatar_card: user.avatar_card
    };

    const sign_options = {
      expiresIn: jwt_config.TOKEN_LIFETIME,
      algorithm: 'RS256'
    };

    jwt.sign(token_payload, privateKey, sign_options, callback);
  };

  exports.generateForgotPasswordToken = function(user, callback) {
    const file_name = path.join(__dirname, '../auth/config') + '/private.key';
    const privateKey = fs.readFileSync(file_name, 'utf8');

    // Token generation
    const token_payload = {
      _id: user._id
    };

    const sign_options = {
      expiresIn: jwt_config.FORGOT_PASSWORD_TOKEN_LIFETIME,
      algorithm: 'RS256'
    };

    return jwt.sign(token_payload, privateKey, sign_options, callback);
  };

  exports.generateEmailValidationToken = function(email, callback) {
    const file_name = path.join(__dirname, '../auth/config') + '/private.key';
    const privateKey = fs.readFileSync(file_name, 'utf8');

    // Token generation
    const token_payload = {
      email: email
    };

    const sign_options = {
      expiresIn: jwt_config.FORGOT_PASSWORD_TOKEN_LIFETIME,
      algorithm: 'RS256'
    };

    return jwt.sign(token_payload, privateKey, sign_options, callback);
  };

  return exports;

})();

module.exports = AuthLib;
