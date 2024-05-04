import mongoose from "mongoose";

const matchesSchema = new mongoose.Schema({
    like : {
        type : mongoose.Schema.Types.ObjectId,
        ref :'Match'
    },
    likedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Match'
    }
}, {timestamps : true})

export const Match = mongoose.model('Match', matchesSchema);