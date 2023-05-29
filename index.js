"use strict";

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const session = require("express-session");

const expressHandlebars = require("express-handlebars");
const { createPagination } = require("express-handlebars-paginate");

const { createStarList } = require("./controllers/handlebarsHelper");

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
    secret: "53creT",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 20 * 60 * 1000, // 20 minutes
    },
  })
);

// Setup cart middleware
app.use((req, res, next) => {
  const Cart = require("./controllers/cart");
  req.session.cart = new Cart(req.session.cart ? req.session.cart : {});
  res.locals.quantity = req.session.cart.quantity;

  next();
});

// Setup routes
app.use("/", require("./routes/indexRouter"));
app.use("/products", require("./routes/productsRouter"));

app.use((req, res, next) => {
  res.status(404).render("error", { message: "File not Found!" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render("error", { message: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
