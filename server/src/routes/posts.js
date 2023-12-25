const express = require("express");

const postsController = require("../controllers/postsController");
const verifyAuth = require("../middlewares/verifyAuth")

const postsRouter = express.Router();

// GET posts
postsRouter.get("/", postsController.getPosts);

// GET post by id
postsRouter.get("/:id", postsController.getPostById);

// CREATE new post
postsRouter.post("/", verifyAuth, postsController.createPost);

// UPDATE post
postsRouter.put("/:id", postsController.updatePost);

// DELETE post
postsRouter.delete("/:id", postsController.deletePost);

module.exports = postsRouter;