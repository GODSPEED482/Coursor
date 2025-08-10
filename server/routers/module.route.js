const router = require("express").Router();
const createModuleController = require("../controllers/createmodule.controller.js");

router.post("/create", createModuleController);

module.exports = router;