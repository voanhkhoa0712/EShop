"use strict";

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const expressHandlebars = require("express-handlebars");

app.use(express.static(__dirname + "/public"));

app.engine(
  "hbs",
  expressHandlebars.engine({
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
    extname: "hbs",
    defaultLayout: "layout",
  })
);

app.set("view engine", "hbs");

app.use("/", require("./routes/indexRouter"));

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
