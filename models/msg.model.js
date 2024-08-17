import mongoose from "mongoose";

const MsgSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String },
  },
  {
    timestamps: true,
  }
);

const Msg = mongoose.model("Msg", MsgSchema);

export { Msg };
