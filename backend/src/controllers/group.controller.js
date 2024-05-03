import { ApiError } from "../utils/ApiError.js";
import { Group } from "../models/group.model.js";
import { isObjectValid } from "../utils/Validator.js";
import uploadOnCDN from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


export const registerGroup = async(req, res) => {

    const groupDetails = req.body; 
    if(!isObjectValid(groupDetails)){
        throw new ApiError(400, "All fields are required.");
    }
    const {name, email, password, bio, age} = groupDetails;

    const existingGroup = await Group.findOne({
        email
    });

    if(existingGroup){
        throw new ApiError(409, "Group with email or username already exists.");
    }

    //multer keeps the file in the temp folder and returns us the file path
    console.log(req.files.profile_picture[0].path);
    const profile_picture_localPath = req.files.profile_picture[0].path;
    if(!profile_picture_localPath){
        throw new ApiError(400, "Profile Picture is required");
    }

    const profile_picture = await uploadOnCDN(profile_picture_localPath);

    if(!profile_picture){
        throw new ApiError(400, "Profile Picture is required");
    }
    
    const group = await Group.create({
        name,
        email,
        password,
        profile_picture : profile_picture.url,
        bio,
        age
    });

    const createdGroup = await Group.findById(group._id).select(
        "-password -refreshToken"
    );

    if(!createdGroup){
        throw new ApiError(500, "Something went wrong while registering the group.");
    }

    return res.status(201).json(
        new ApiResponse(200, createdGroup, "Group registered successfully")
    )
}

const generateAccessAndRefreshToken = async(groupID) => {
    try {
        const group = await Group.findById(groupID);

        const accessToken = group.generateAccessToken()

        const refreshToken = group.generateRefreshToken()

        group.refreshToken = refreshToken;

        await group.save({ validateBeforeSave : false})

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}


export const getNewRefreshToken = async(req, res) => {
    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    try {
        const group = await Group.findById(decodedRefreshToken._id);
    
        if(!group){
            throw new ApiError(401, "Invalid refresh token");
        }
    
        if(incomingRefreshToken !== group?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(group._id);
    
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken",  refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, 
                    refreshToken : refreshToken
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
};