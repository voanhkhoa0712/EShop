"use strict";

const express = require("express");
const router = express.Router();
const controller = require("../controllers/productsController");

router.get("/", controller.getData, controller.show);
router.get("/:id", controller.getData, controller.showDetail);

module.exports = router;
