"use strict";
require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const expressHandlebars = require("express-handlebars");
const { createPagination } = require("express-handlebars-paginate");

const session = require("express-session");
const passport = require("./controllers/passport");
const flash = require("connect-flash");

const { createStarList } = require("./controllers/handlebarsHelper");

// Setup Redis session
const redisStore = require("connect-redis").default;
const { createClient } = require("redis");
const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect().catch(console.error);

// Setup public static folder
app.use(express.static(__dirname + "/public"));

// Setup Handlebars templater
app.engine(
  "hbs",
  expressHandlebars.engine({
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
    extname: "hbs",
    defaultLayout: "layout",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
    },
    helpers: {
      createStarList,
      createPagination,
    },
  })
);

app.set("view engine", "hbs");

// Setup HTTP post
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new redisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 20 * 60 * 1000, // 20 minutes
    },
  })
);

// Setup passport for login
app.use(passport.initialize());
app.use(passport.session());

// Setup connect-flash for session error warning
app.use(flash());

// Setup init middleware
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.isAuthenticated();

  const Cart = require("./controllers/cart");
  req.session.cart = new Cart(req.session.cart ? req.session.cart : {});
  res.locals.quantity = req.session.cart.quantity;

  next();
});

// Setup routes
app.use("/", require("./routes/indexRouter"));
app.use("/products", require("./routes/productsRouter"));
app.use("/users", require("./routes/authRouter"));
app.use("/users", require("./routes/usersRouter"));

// Handle error routes
app.use((req, res, next) => {
  res.status(404).render("message", { message: "File not Found!" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render("message", { message: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
