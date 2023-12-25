const express = require("express");

const authController = require("../controllers/authController");
const validateRegisterInput = require("../middlewares/validRegister");

const authRouter = express.Router();

authRouter.post("/login", authController.login);

authRouter.post("/register", validateRegisterInput ,authController.register);

module.exports = authRouter;