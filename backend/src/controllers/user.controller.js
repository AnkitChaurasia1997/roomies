import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { isObjectValid } from "../utils/Validator.js";
import uploadOnCDN from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";




const generateAccessAndRefreshToken = async(userID) => {
    try {
        const user = await User.findById(userID);

        const accessToken = user.generateAccessToken()

        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave : false})

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}


export const registerUser = async(req, res) => {

    const userDetails = req.body; 
    if(!isObjectValid(userDetails)){
        throw new ApiError(400, "All fields are required.");
    }
    const {username, email, firstName, lastName, bio, age, password} = userDetails;

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    });

    if(existingUser){
        throw new ApiError(409, "User with email or username already exists.");
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
    
    const user = await User.create({
        username,
        email,
        firstName,
        lastName,
        profile_picture : profile_picture.url,
        bio,
        age,
        password
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user.");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
}

export const getProfile = async(req, res) => {

    let userId = req.params.userId;
    if(!userId){
        throw new ApiError(400, "userId Required")
    }
    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(500, "Something went wrong while getting the user.");
    }

    return res.status(201).json(
        new ApiResponse(200, user)
    )

}

export const setProfile = async(req, res) => {

    const userId = req.params.userId; 
    if(!userId){
        throw new ApiError(400, "userId Required")
    }
    const userDetails = req.body;
    console.log(userDetails)

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const updatedObj = {};

    for (const key in userDetails) {
        if (Object.hasOwnProperty.call(userDetails, key)) {
            if (user.schema.path(key)) {
                updatedObj[key] = userDetails[key];
            }
        }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedObj, { new: true });

    if(!updatedUser){
        throw new ApiError(500, "Something went wrong while updating the user.");
    }

    return res.status(201).json(
        new ApiResponse(200, updatedUser, "User profile updated successfully")
    )

}


export const loginUser = async(req, res) => {

    console.log(req);
    const { username, password } = req.body;

    if(!username){
        throw new ApiError(400, "Username Required")
    }

    if(!password){
        throw new ApiError(400, "Password Required")
    }

    const user = await User.findOne({username});

    if(!user){
        throw new ApiError(404, "User does not exist");

    }

    
   const isPasswordValid = await user.isPasswordCorrect(password);

   if(!isPasswordValid){
        throw new ApiError(401, "Invalid Credentials");
   }

   const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //sending these to cookies

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            'User logged in successfully'
        )
    )
}


export const logoutUser = async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {} , "User logged out successfully"));

};


export const getNewRefreshToken = async(req, res) => {
    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    try {
        const user = await User.findById(decodedRefreshToken._id);
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    
    
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