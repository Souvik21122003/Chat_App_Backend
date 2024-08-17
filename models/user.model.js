import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  let newPassword = await bcrypt.hash(this.password, 15);
  this.password = newPassword;
  next();
});

userSchema.methods.generateRefreshToken = async function () {
  try {
    const token = await jwt.sign(
      {
        id: this._id,
        username: this.username,
      },
      process.env.JWT_SECRET, // Ensure this is set in your environment variables
      {
        expiresIn: "7d", // Adjust expiry for refresh tokens
      }
    );

    console.log(token, "token generated");
    
    return token;
  } catch (error) {
    console.error("Error generating JWT refresh token:", error); // Improved error logging
    throw new Error("Error generating JWT refresh token");
  }
};

const User = mongoose.model("User", userSchema);

export { User };
