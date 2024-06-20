import userModel from "../models/users.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
  let userName = req.body.userName;
  let password = req.body.password;
  let userType = req.body.userType;

  if (!userName) {
    return res.status(400).json({
      Status: "Failed",
      message: "Username required!",
    });
  }

  if (!password) {
    return res.status(400).json({
      Status: "Failed",
      message: "Password required!",
    });
  }

  if (!userType) {
    return res.status(400).json({
      Status: "Failed",
      message: "userType required!",
    });
  }

  const user = await userModel.findOne({ userName });

  if (user) {
    return res.status(400).json({
      Status: "Failed",
      message: "User with that username already exists!",
    });
  }

  // Define the number of salt rounds for bcrypt
  const saltRounds = 10;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new userModel({
      userName,
      password: hashedPassword, // Save the hashed password
      userType,
    });

    await newUser.save();
    res.status(200).json({
      Status: "Success",
      message: "User Created successfully!",
      user: newUser,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const Login = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName) {
    return res.status(400).json({
      Status: "Failed",
      message: "Username required!",
    });
  }

  if (!password) {
    return res.status(400).json({
      Status: "Failed",
      message: "Password required!",
    });
  }

  try {
    const user = await userModel.findOne({ userName });

    if (!user) {
      return res.status(404).json({
        Status: "Failed",
        message: "The user doesn't exist!",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        Status: "Failed",
        message: "Invalid password!",
      });
    }

    return res.status(200).json({
      Status: "Success",
      message: "Login successful!",
      user: {
        id: user._id,
        userName: user.userName,
        userType: user.userType,
      },
    });
  } catch (error) {
    return res.status(500).json({
      Status: "Error",
      message: "An error occurred during login",
      error: error.message,
    });
  }
};

export const listUsers = async (req, res) => {
  const userType = req.body.userType;

  if (userType !== "admin") {
    return res.status(400).json({
      Status: "Failed",
      message: "Not Authorized!",
    });
  }

  try {
    const users = await userModel.aggregate(
      [
        {
          $match: {}
        },
        {$project: {
          id: "$_id",
            _id: 0,
          userName:1,
          userType:1
        }}
      ]
      
    );

    return res.status(200).json({
      Status: "Success",
      message: "Fetched Users!",
      users
    });
  } catch (error) {
    return res.status(500).json({
      Status: "Error",
      message: "An error occurred..couldn't fetch users",
      error: error.message,
    });
  }
};
