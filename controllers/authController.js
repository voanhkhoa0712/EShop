"use strict";

const controller = {};
const passport = require("./passport");

controller.show = (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/");

  res.render("login", {
    loginMessage: req.flash("loginMessage"),
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

module.exports = controller;
