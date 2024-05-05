import mongoose from "mongoose";
import { User } from "./user.model.js";

const matchSchema = new mongoose.Schema({
    like : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    likedby : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
}, {timestamps : true})

export const Match = mongoose.model("Match", matchSchema)
