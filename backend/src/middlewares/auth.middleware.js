// verifies if the user is there or not

import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Group } from "../models/group.model.js";
export const verifyJWT = async(req, res, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.("Bearer", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -likes").lean()
         || await Group.findById(decodedToken?._id).select("-password -refreshToken -likes").lean();
    
        if(!user){
    
            throw new ApiError(401, "Invalid Access Token");
        }
        
        req.user = user;
        // console.log(req);
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
}