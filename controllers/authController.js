"use strict";

const controller = {};
const passport = require("./passport");

controller.show = (req, res) => {
  res.render("login", { loginMessage: req.flash("loginMessage") });
};

controller.login = (req, res, next) => {
  const keepSignedIn = req.body.keepSignedIn;

  passport.authenticate("local-login", (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect("/users/login");

    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.cookie.maxAge = keepSignedIn ? 24 * 60 * 60 * 1000 : null;
      return res.redirect("/users/my-account");
    });
  })(req, res, next);
};

controller.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

module.exports = controller;
