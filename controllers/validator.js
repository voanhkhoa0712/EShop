"use strict";

const { body, validationResult } = require("express-validator");

function getErrorMessage(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errorArray = errors.array();
    return errorArray.reduce((message, error) => {
      return message + error.msg + "<br/>";
    }, "");
  }
}

module.exports = { body, getErrorMessage };
