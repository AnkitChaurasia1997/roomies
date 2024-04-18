import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { isObjectValid } from "../utils/Validator.js";
import uploadOnCDN from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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