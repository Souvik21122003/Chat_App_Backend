import { Router } from "express";
import {
  getAllUser,
  getMsg,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/verifyjwt.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/profile").get(getUser);
router.route("/msg/:userId/:recipientId").get(getMsg);
router.route("/allUser").get(getAllUser);

export default router;
