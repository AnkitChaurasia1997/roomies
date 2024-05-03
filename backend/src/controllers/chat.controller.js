import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../models/chat.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const saveChat = async(req, res) => {
    try {
        const chat = new Chat({
            sender_id : req.body.sender_id,
            receiver_id : req.body.receiver_id,
            message : req.body.message,
        })

        await chat.save();
        
        return res.status(200)
        .json( new ApiResponse(
            200,
            {
                success : true,
                message : req.body.message,
                sender_id : req.body.sender_id,
                receiver_id : req.body.receiver_id,
            },
            `${req.body.message} saved`
        ))
    } catch (error) {
        throw new ApiError(400, error?.message || "Failed to save chat message");
    }
}