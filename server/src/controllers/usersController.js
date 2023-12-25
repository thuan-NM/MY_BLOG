const { ObjectId } = require("mongodb");

const { db } = require("../utils/connectDb");

// GET posts
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const skip = (page -1) * pageSize;
    const [users, totalCount] = await Promise.all([
      db.users.find({}).skip(skip).limit(pageSize).toArray(),
      db.users.countDocuments({}),
    ]);
    const totalPages = Math.ceil(totalCount / pageSize);
    res.status(200).json({
      message: "Get users list successful",
      data: users,
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

const getCurrentUser = async (req, res) => {
  try {
    // Extract user ID from the token payload
    const userId = req.user.userId;

    // Fetch user data based on the user ID
    const user = await db.users.findOne({
      _id: new ObjectId(userId),
    });

    res.status(200).json({
      message: "Get current user successful",
      data: user,
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
const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await db.users.findOne({
      _id: new ObjectId(id),
    });
    res.status(200).json({
      message: "Get user detail by id successful",
      data: user,
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
const updateUser = async (req, res) => {
  const { username, email, password, friend } = req.body;
  try {
    const id = req.params.id;
    const user = await db.users.findOne({ _id: new ObjectId(id) });

    // Kiểm tra và chuyển đổi friend thành mảng nếu cần
    const friendList = Array.isArray(friend) ? friend : [friend];

    // Đảm bảo friend là một mảng
    const currentFriends = user.friend || [];
    const friendRequests = user.friendRequests || [];

    // Kiểm tra xem đã gửi lời mời chưa
    if (!currentFriends.includes(friend) && !friendRequests.includes(friend)) {
      // Nếu chưa là bạn bè và chưa có lời mời, thêm vào danh sách lời mời
      await db.users.updateOne(
        { _id: new ObjectId(id) },
        { $push: { friendRequests: { $each: friendList } } }
      );
    }

    res.status(200).json({
      message: "Update user by id successful",
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

const acceptFriendRequest = async (req, res) => {
  const userId = req.params.id;
  const friendRequestId = req.body.friendRequestId;
  console.log(friendRequestId)
  const acceptRequest = req.body.acceptRequest;

  try {
    // Lấy thông tin user1 (người gửi lời mời)
    const user1 = await db.users.findOne({ _id: new ObjectId(userId) });

    if (!user1) {
      return res.status(404).json({ message: 'User not found', isSuccess: 0 });
    }

    // Lấy thông tin user2 (người nhận lời mời)
    const user2 = await db.users.findOne({ _id: new ObjectId(friendRequestId) });

    if (!user2) {
      return res.status(404).json({ message: 'Friend not found', isSuccess: 0 });
    }

    if (acceptRequest) {
      // Chấp nhận lời mời
      user1.friend.push(friendRequestId);
      user2.friend.push(userId);

      // Xóa lời mời từ danh sách của user1
      user1.friendRequests = user1.friendRequests.filter(
        (request) => request.toString() !== friendRequestId.toString()
      );
      user2.friendRequests = user2.friendRequests.filter(
        (request) => request.toString() !== userId.toString()
      );
    } else {
      // Từ chối lời mời
      // Xóa lời mời từ danh sách của cả hai user
      user1.friendRequests = user1.friendRequests.filter(
        (request) => request.toString() !== friendRequestId.toString()
      );
      user2.friendRequests = user2.friendRequests.filter(
        (request) => request.toString() !== userId.toString()
      );
    }

    // Cập nhật thông tin của cả hai user
    await db.users.updateOne({ _id: new ObjectId(userId) }, { $set: user1 });
    await db.users.updateOne({ _id: new ObjectId(friendRequestId) }, { $set: user2 });

    res.json({ message: 'Friend request processed successfully', isSuccess: 1 });
  } catch (error) {
    console.error('Error processing friend request:', error);
    res.status(500).json({ message: 'Failed to process friend request', isSuccess: 0 });
  }
};

const sendFriendRequest = async (req, res) => {
  const userId = req.params.id;
  const friendId = req.body.id;

  try {
    const user = await db.users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found', isSuccess: 0 });
    }

    // Kiểm tra xem đã gửi lời mời chưa
    if (user.friendRequests.includes(friendId)) {
      return res.status(400).json({ message: 'Friend request already sent', isSuccess: 0 });
    }

    // Gửi lời mời kết bạn
    user.friendRequests.push(friendId);

    await db.users.updateOne({ _id: new ObjectId(userId) }, { $set: user });

    res.json({ message: 'Friend request sent successfully', isSuccess: 1 });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Failed to send friend request', isSuccess: 0 });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  acceptFriendRequest,
  sendFriendRequest, 
  getCurrentUser,// Thêm hàm này
};