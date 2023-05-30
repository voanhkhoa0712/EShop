"use strict";

const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const models = require("../models");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await models.User.findOne({
      attributes: ["id", "email", "firstName", "lastName", "mobile", "isAdmin"],
      where: { id },
    });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      if (email) {
        email = email.toLowerCase();
      }

      try {
        // Not login yet
        if (!req.user) {
          const user = await models.User.findOne({ where: { email } });

          // Not registry yet
          if (!user) {
            return done(
              null,
              false,
              req.flash("loginMessage", "Email does not exist!")
            );
          }

          // Wrong password
          if (!bcrypt.compareSync(password, user.password)) {
            return done(
              null,
              false,
              req.flash("loginMessage", "Wrong password!")
            );
          }

          // Finish Login
          return done(null, user);
        }

        // Logined
        done(null, req.user);
      } catch (err) {
        done(error);
      }
    }
  )
);

module.exports = passport;
