const express = require("express");

const userController = require("../controllers/usersController");
const verifyAuth = require("../middlewares/verifyAuth")

const usersRouter = express.Router();

// GET posts
usersRouter.get("/", userController.getUsers);

// GET post by id
usersRouter.get("/:id", userController.getUserById);

usersRouter.get('/current-user',userController.getCurrentUser);

// UPDATE post
usersRouter.put("/:id", userController.updateUser);

usersRouter.put('/:id/accept-friend-request', verifyAuth, userController.acceptFriendRequest);

usersRouter.put('/:id/send-friend-request', verifyAuth, userController.sendFriendRequest);

module.exports = usersRouter;