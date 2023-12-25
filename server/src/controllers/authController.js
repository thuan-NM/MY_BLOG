const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();

const validateRegisterInput = require("../middlewares/validRegister")
const { db } = require("../utils/connectDb");

const register = async (req, res) => {
    const { username, email, password, confirmpassword } = req.body;
    const existingUser = await db.users.findOne({
        username: username
    });
    if (existingUser) {
        return res.status(409).json({ message: "Username already exists" , isSuccess: 0,});
      }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
        username: username,
        email: email,
        password: hashedPassword,
        friend: [],
        friendRequests: [],
    };
    await db.users.insertOne(newUser);
    res.status(201).json({
        message: "Register Successfully !",
        data: newUser,
        isSuccess: 1,
    });
}

const login = async(req, res) => {
    try {
    // Create checkAcount function to check students account with name and age
        const { username, password } = req.body;
        const user = await db.users.findOne({ username: username, });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
    
        const isPasswordMatch = await bcrypt.compare(password, user.password);
    
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.json({
            message: 'Login successful',
            token,
            user: user,
            isSuccess: 1,
        });
        } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Failed to log in' });
        }
};

module.exports = { login, register };