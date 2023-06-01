"use strict";

const controller = {};
const passport = require("./passport");
const models = require("../models");

controller.show = (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/");

  res.render("login", {
    loginMessage: req.flash("loginMessage"),
    registerMessage: req.flash("registerMessage"),
    reqUrl: req.query.reqUrl,
  });
};

controller.login = (req, res, next) => {
  const keepSignedIn = req.body.keepSignedIn;
  const reqUrl = req.body.reqUrl ? req.body.reqUrl : "/users/my-account";
  const cart = req.session.cart;

  passport.authenticate("local-login", (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect(`/users/login?reqUrl=${reqUrl}`);

    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.cookie.maxAge = keepSignedIn ? 24 * 60 * 60 * 1000 : null;
      req.session.cart = cart;
      return res.redirect(reqUrl);
    });
  })(req, res, next);
};

controller.logout = (req, res, next) => {
  const cart = req.session.cart;

  req.logout((err) => {
    if (err) return next(err);
    req.session.cart = cart;
    res.redirect("/");
  });
};

controller.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  res.redirect(`/users/login?reqUrl=${req.originalUrl}`);
};

controller.register = (req, res, next) => {
  const reqUrl = req.body.reqUrl ? req.body.reqUrl : "/users/my-account";
  const cart = req.session.cart;

  passport.authenticate("local-register", (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect(`/users/login?reqUrl=${reqUrl}`);
    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.cart = cart;
      res.redirect(reqUrl);
    });
  })(req, res, next);
};

controller.showForgotPassword = (req, res) => {
  res.render("forgot-password");
};

controller.forgotPassword = async (req, res) => {
  const email = req.body.email;

  // Check if user exist
  const user = await models.User.findOne({ where: { email } });
  if (user) {
    const { sign } = require("./jwt");
    const host = req.header("host");
    const resetLink = `${req.protocol}://${host}/users/reset?token=${sign(
      email
    )}&email=${email}`;

    const { sendForgotPasswordMail } = require("./mail");
    sendForgotPasswordMail(user, host, resetLink)
      .then((result) => {
        console.log("Email has been sent");
        return res.render("forgot-password", { done: true });
      })
      .catch((error) => {
        console.log(error.statusCode);
        return res.render("forgot-password", {
          message: "An error has occured when sending to your email!",
        });
      });
  } else {
    return res.render("forgot-password", { message: "Email does not exist" });
  }
};

controller.showResetPassword = (req, res) => {
  const email = req.query.email;
  const token = req.query.token;
  const { verify } = require("./jwt");
  if (!token || !verify(token)) {
    return res.render("reset-password", { expired: true });
  } else {
    return res.render("reset-password", { email, token });
  }
};

controller.resetPassword = async (req, res) => {
  const email = req.body.email;
  const token = req.body.token;
  const bcrypt = require("bcrypt");
  const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8));

  await models.User.update({ password }, { where: { email } });
  res.render("reset-password", { done: true });
};

module.exports = controller;
