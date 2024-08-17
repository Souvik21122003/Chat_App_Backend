import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: "https://chat-app-navy-five.vercel.app/",
    credentials: true,
    // Replace with your frontend's URL
  })
);
app.use(express.json());
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";

app.use("/api/v1/user", userRouter);

export default app;
