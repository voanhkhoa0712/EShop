"use strict";

const express = require("express");
const router = express.Router();
const controller = require("../controllers/usersController");
const { body, validationResult } = require("express-validator");
const authController = require("../controllers/authController");

router.use(authController.isLoggedIn);

router.get("/checkout", controller.checkout);
router.post(
  "/placeorder",
  body("firstName").notEmpty().withMessage("First name is required!"),
  body("lastName").notEmpty().withMessage("Last name is required!"),
  body("email")
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Invalid email address"),
  body("mobile").notEmpty().withMessage("Mobile is required!"),
  body("address").notEmpty().withMessage("Address is required!"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (req.body.addressId == "0" && !errors.isEmpty()) {
      const errorsArray = errors.array();
      let message = "";
      errorsArray.forEach((error) => {
        message += error.msg + "<br/>";
      });
      return res.render("message", { message });
    }
    next();
  },
  controller.placeorder
);

router.get("/my-account", (req, res) => {
  res.render("my-account");
});

module.exports = router;
