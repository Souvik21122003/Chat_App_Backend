import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { Msg } from "../models/msg.model.js";

const registerUser = async function (req, res) {
  try {
    let { username, password } = req.body;

    username = username.trim();
    password = password.trim();

    if (!username) throw new Error("username must not be empty");

    const foundUser = await User.findOne({ username: username });

    if (foundUser) {
      return res.status(400).json({
        exists: "true",
      });
    }

    const newUser = new User({
      username: username,
      password: password,
    });

    const token = await newUser.generateRefreshToken();
    newUser.refreshToken = token;

    await newUser.save({ validateBeforeSave: false });

    const options = {
      httpOnly: false,
      secure: true,
      sameSite: "None",
    };
    console.log("user registered successfully");

    return res.status(200).cookie("refreshToken", token, options).json({
      username: newUser.username,
      _id: newUser._id,
      message: "ok",
      refreshToken: newUser.refreshToken,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loginUser = async function (req, res) {
  try {
    let { username, password } = req.body;
    username = username.trim();
    password = password.trim();

    const foundUser = await User.findOne({ username: username });

    if (!foundUser) throw new Error("you must register before login");

    const hashed = foundUser.password;

    const compareResult = await bcrypt.compare(password, hashed);

    if (!compareResult) throw new Error("please put correct credentials");

    const token = await foundUser.generateRefreshToken();
    foundUser.up;
    foundUser.refreshToken = token;

    // console.log(token, "token found inside login");

    await foundUser.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res.status(200).cookie("refreshToken", token, options).json({
      username: foundUser.username,
      _id: foundUser._id,
      message: "ok",
      refreshToken: foundUser.refreshToken,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const logoutUser = async function (req, res) {
  try {
    console.log("logging request from logOutUser", req.user);

    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    ).select("-password");

    const options = {
      httpOnly: false,
      secure: true,
    };

    return res.status(200).clearCookie("refreshToken", options).json({
      message: "ok",
    });
  } catch (error) {
    console.log(error.message);
  }
};

const getUser = async function (req, res) {
  try {
    const token =
      req.cookies?.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new Error("no token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const foundLoggedInUser = await User.findById(decoded?.id).select(
      "-password"
    );

    return res.status(200).json({
      username: foundLoggedInUser.username,
      id: foundLoggedInUser._id,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const getMsg = async function (req, res) {
  try {
    const { userId, recipientId } = req.params;
    console.log(userId, recipientId);

    console.log("got inside finding msg ");

    const result = await Msg.find({
      $or: [
        { $and: [{ sender: userId }, { recipient: recipientId }] },
        { $and: [{ sender: recipientId }, { recipient: userId }] },
      ],
    })
      .sort({ createdAt: 1 })
      .select(" -updatedAt -__v");

    console.log(result);

    return res.status(200).json({
      result: result,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const getAllUser = async function (req, res) {
  try {
    const AllUser = await User.find({}).select(
      " -updatedAt -__v -password -refreshToken -createdAt"
    );
    console.log(AllUser);

    return res.status(200).json({
      AllUser,
    });
  } catch (error) {
    console.log(error.message);
  }
};

export { registerUser, loginUser, logoutUser, getUser, getMsg, getAllUser };
