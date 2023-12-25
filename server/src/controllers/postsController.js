const { ObjectId } = require("mongodb");

const { db } = require("../utils/connectDb");

// GET posts
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const skip = (page -1) * pageSize;
    const searchQuery = req.query.search || ""; // Lấy trường search từ query parameter
    const searchFilter = searchQuery
      ? { $text: { $search: searchQuery} }
      : {};
    await db.posts.createIndex({ content: "text" });
    const [posts, totalCount] = await Promise.all([
      db.posts.find(searchFilter).skip(skip).limit(pageSize).toArray(),
      db.posts.countDocuments(searchFilter),
    ]);
    const totalPages = Math.ceil(totalCount / pageSize);
    res.status(200).json({
      message: "Get post list successful",
      data: posts,
      page,
      pageSize,
      totalPages,
      totalCount,
      isSuccess: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      isSuccess: false,
    });
  }
};

// GET post by id
const getPostById = async (req, res) => {
  try {
    const id = req.params.id;
    const post = await db.posts.findOne({
      _id: new ObjectId(id),
    });
    res.status(200).json({
      message: "Get post detail by id successful",
      data: post,
      isSuccess: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      isSuccess: false,
    });
  }
};

// CREATE new post
const createPost = async (req, res) => {
  try {
    const { title, content, author, hashtags } = req.body;
    if (content === null || !hashtags || !title ) {
      return res.status(400).json({
          message: "All fields are required",
          isSuccess: 0,
      });
    }
    const post = {
      title,
      content,
      author, // const author = req.user get jwt
      hashtags,
    };
    await db.posts.insertOne(post);
    res.status(201).json({
      message: "Create a post successful",
      data: post,
      isSuccess: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      isSuccess: false,
    });
  }
};

// UPDATE post
const updatePost = async (req, res) => {
  const { title, content, author, hashtags } = req.body;
  try {
    const id = req.params.id;
    await db.posts.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          title: title,
          content: content,
          author: author,
          hashtags: hashtags,
        },
      }
    );
    res.status(200).json({
      message: "Update post by id successful",
      data: { ...req.body, id: id },
      isSuccess: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      isSuccess: false,
    });
  }
};

// DELETE post by id
const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    await db.posts.deleteOne({
      _id: new ObjectId(id),
    });
    res.status(200).json({
      message: "Delete post by id successful",
      data: { id },
      isSuccess: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      isSuccess: false,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};