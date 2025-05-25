const express = require("express");
const router = express.Router();
const { infoController } = require("../../controllers");
router.use("/info", infoController);

module.exports = router;
