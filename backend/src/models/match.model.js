import mongoose from "mongoose";
import { User } from "./user.model.js";

const matchSchema = new mongoose.Schema({
    like: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'likeType'
    },
    likedby: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'likedbyType'
    },
    likeType: {
      type: String,
      enum: ['User', 'Group']
    },
    likedbyType: {
      type: String,
      enum: ['User', 'Group']
    }
  }, { timestamps: true })

export const Match = mongoose.model("Match", matchSchema)
