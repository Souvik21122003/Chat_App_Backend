import jwt from "jsonwebtoken";
import "dotenv/config";
import { User } from "../models/user.model.js";

const verifyJwt = async function (req, res, next) {
  try {
    const token =
      req.cookies?.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error("token missing");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log("token", decodedToken);

    const user = await User.findById(decodedToken?.id).select("-password");

    if (!user) throw new Error("Invalid Token");

    req.user = user;

    next();
  } catch (error) {}
};

export { verifyJwt };
