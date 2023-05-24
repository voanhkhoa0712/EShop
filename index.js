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

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
