import { ApiError } from "../utils/ApiError.js";
import { User, userSchema } from "../models/user.model.js";
import { Match } from "../models/match.model.js";
import { Group } from "../models/group.model.js";
import { isObjectValid } from "../utils/Validator.js";
import uploadOnCDN from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import * as helper from "../utils/Validator.js";
import mongoose from "mongoose";



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
    if(!userDetails.username || !userDetails.email || !userDetails.firstName || !userDetails.lastName || !userDetails.bio || !userDetails.age || !userDetails.password || !userDetails.confirmPassword){
        return res.status(400).render('register_user',{error:"All fields are required.",username:userDetails.username, email:userDetails.email, firstName:userDetails.firstName, lastName:userDetails.lastName, bio:userDetails.bio, age:userDetails.age});
    }
    if(userDetails.password!==userDetails.confirmPassword){
        return res.status(400).render('register_user',{error:"Password do not match",username:userDetails.username, email:userDetails.email, firstName:userDetails.firstName, lastName:userDetails.lastName, bio:userDetails.bio, age:userDetails.age});
    }


    if(!isObjectValid(userDetails)){
        res.status(400).render('register_user',{error:"All fields are required.",username:userDetails.username, email:userDetails.email, firstName:userDetails.firstName, lastName:userDetails.lastName, bio:userDetails.bio, age:userDetails.age});
       // throw new ApiError(400, "All fields are required.");
    }
    const {
        username, email, firstName, lastName, bio, age, password} = userDetails;
    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    });

    if(existingUser){
        return res.status(400).render('register_user',{error:"User with email or username already exists.", username:userDetails.username, email:userDetails.email, firstName:userDetails.firstName, lastName:userDetails.lastName, bio:userDetails.bio, age:userDetails.age});
       // throw new ApiError(409, "User with email or username already exists.");
    }

    //multer keeps the file in the temp folder and returns us the file path
    // console.log(req.files.profile_picture[0].path);


//---------------------------------------------------------------------------------//
if (!req.files || !req.files.profile_picture || !req.files.profile_picture[0]) {
    return res.status(400).render('register_user',{error:"No Image uploaded", username:userDetails.username, email:userDetails.email, firstName:userDetails.firstName, lastName:userDetails.lastName, bio:userDetails.bio, age:userDetails.age});

}

const image = req.files.profile_picture[0];

if (!image.mimetype.startsWith('image/')) {
    return res.status(400).render('register_user',{error:"Only Images allowed in profile Pic", username:userDetails.username, email:userDetails.email, firstName:userDetails.firstName, lastName:userDetails.lastName, bio:userDetails.bio, age:userDetails.age});

}   

    const profile_picture_localPath = req.files.profile_picture[0].path;
    if(!profile_picture_localPath){
        return res.status(400).render('register_user',{error:"Profile Pic Required.", username:userDetails.username, email:userDetails.email, firstName:userDetails.firstName, lastName:userDetails.lastName, bio:userDetails.bio, age:userDetails.age});

    }

    const profile_picture = await uploadOnCDN(profile_picture_localPath);

    if(!profile_picture){
        return res.status(400).render('register_user',{error:"Profile Pic Required.", username:userDetails.username, email:userDetails.email, firstName:userDetails.firstName, lastName:userDetails.lastName, bio:userDetails.bio, age:userDetails.age});
    }
    
//-------------------------------------------------------------------------------//
try {
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
    // Continue with success logic if user creation succeeds
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        return res.status(400).render('register_user',{error:"Something went wrong while registering the user.", username:userDetails.username, email:userDetails.email, firstName:userDetails.firstName, lastName:userDetails.lastName, bio:userDetails.bio, age:userDetails.age});
    }

    res.redirect('/api/v1/users/login');

} catch (err) {
    // Handle the error here
    return res.status(400).render('register_user', {
        error: err.message,
        username: userDetails.username,
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        bio: userDetails.bio,
        age: userDetails.age
    });
}

   
}

export const getProfile = async(req, res) => {

    let userId = req.params.userId;
    if(!userId){
        throw new ApiError(400, "userId Required")
    }
    const user = await User.findById(userId).select('-password');

    if(!user){
        throw new ApiError(500, "Something went wrong while getting the user.");
    }

    return res.status(201).json(
        new ApiResponse(200, user)
    )

}

export const setProfile = async(req, res) => {

    const userId = req.user._id; 
    if(!userId){
        throw new ApiError(400, "userId Required")
    }
    
    const userDetails = req.body;
    let {username, email, firstName, lastName, bio, age, looking_forBHK, zipcode, food_choices, profession, ages_between, budget, lifestyle_preferences, looking_for_accommodation} = userDetails;

    if(Array.isArray(food_choices)) {
        if(food_choices[0]) {
            food_choices = food_choices[0];
        } else if(food_choices[1]) {
            food_choices = food_choices[1];
        } else {
            food_choices = '';
        }
    }
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new ApiError(404, "User not found")
    }
        
    
    let updatedObj = {
        username : username,
        email : email,
        firstName : firstName,
        lastName : lastName,
        bio : bio,
        age : age,
        likes : user.likes ? user.likes : [],
        dislikes : user.dislikes ? user.dislikes : []
    }

    let updatedPreferences = {}

    if(user.preferences) {
        if(looking_forBHK) {
            updatedPreferences["looking_forBHK"] = looking_forBHK;
        } else {
            updatedPreferences["looking_forBHK"] = user.preferences.looking_forBHK;
        }
        if(zipcode) {
            updatedPreferences["zipcode"] = zipcode;
        } else {
            updatedPreferences["zipcode"] = user.preferences.zipcode;
        }
        if(food_choices) {
            updatedPreferences["food_choices"] = food_choices;
        } else {
            updatedPreferences["food_choices"] = user.preferences.food_choices;
        }
        if(profession) {
            updatedPreferences["profession"] = profession;
        } else {
            updatedPreferences["profession"] = user.preferences.profession;
        }
        if(ages_between) {
            updatedPreferences["ages_between"] = ages_between;
        } else {
            updatedPreferences["ages_between"] = user.preferences.ages_between;
        }
        if(budget) {
            updatedPreferences["budget"] = budget;
        } else {
            updatedPreferences["budget"] = user.preferences.budget;
        }
        if(lifestyle_preferences) {
            updatedPreferences["lifestyle_preferences"] = lifestyle_preferences;
        } else {
            updatedPreferences["lifestyle_preferences"] = user.preferences.lifestyle_preferences;
        }
        if(looking_for_accommodation) {
            updatedPreferences["looking_for_accommodation"] = looking_for_accommodation;
        } else {
            updatedPreferences["looking_for_accommodation"] = user.preferences.looking_for_accommodation;
        }
    } else {
        if(looking_forBHK) {
            updatedPreferences["looking_forBHK"] = looking_forBHK;
        } else {
            throw new ApiError(400, "looking_forBHK Required");
        }
        if(zipcode) {
            updatedPreferences["zipcode"] = zipcode;
        }
        else {
            throw new ApiError(400, "zipcode Required");
        }
        if(food_choices) {
            updatedPreferences["food_choices"] = food_choices;
        } else {
            throw new ApiError(400, "food_choices Required");
        }
        if(profession) {
            updatedPreferences["profession"] = profession;
        } else {
            throw new ApiError(400, "profession Required");
        }
        if(ages_between) {
            updatedPreferences["ages_between"] = ages_between;
        } else {
            throw new ApiError(400, "ages_between Required");
        }
        if(budget) {
            updatedPreferences["budget"] = budget;
        } else {
            throw new ApiError(400, "budget Required");
        }
        if(lifestyle_preferences) {
            updatedPreferences["lifestyle_preferences"] = lifestyle_preferences;
        } else {
            throw new ApiError(400, "lifestyle_preferences Required");
        }
        if(looking_for_accommodation) {
            updatedPreferences["looking_for_accommodation"] = looking_for_accommodation;
        } else {
            throw new ApiError(400, "looking_for_accommodation Required");
        }
    }

    updatedObj.preferences = updatedPreferences;

    if(user.preferences) {
        for (const key in userDetails) {
            if (Object.hasOwnProperty.call(userDetails, key)) {
                if (Object.keys(user.preferences).includes(key)) {
                    updatedObj[preferences].key = userDetails[key];
                }
            }
        }
    }

    
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

    return res
    .status(200)
    .redirect('/preferences')

}

export const getProfilesForUser = async(req, res) => {

    try {

        const userId = req.params.userId; 
        if(!userId){
            throw new ApiError(400, "userId Required")
        }
        const users = await User.find({}).select('-password -refreshToken');
        if(!users) {
            throw new ApiError(400, "Error getting users")
        }

        const user = await User.findById(userId).select('-password -refreshToken');
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const filteredUsers = await User.aggregate([
            {
                $match: {
                'preferences.looking_forBHK': user.preferences.looking_forBHK,
                'preferences.zipcode': user.preferences.zipcode,
                'preferences.food_choices': user.preferences.food_choices,
                'preferences.profession': user.preferences.profession,
                'preferences.budget': user.preferences.budget,
                'preferences.lifestyle_preferences': { $all: user.preferences.lifestyle_preferences },
                $or: [
                    { 
                    'age': { $lte: user.preferences.ages_between[1] },
                    'age': { $gte: user.preferences.ages_between[0] }
                    }
                ],
                'preferences.looking_for_accommodation' : true
                }
            }
        ]);

        const filteredGroups = await Group.aggregate([
            {
                $match: {
                'preferences.looking_forBHK': user.preferences.looking_forBHK,
                'preferences.zipcode': user.preferences.zipcode,
                'preferences.food_choices': user.preferences.food_choices,
                'preferences.profession': user.preferences.profession,
                'preferences.budget': user.preferences.budget,
                'preferences.lifestyle_preferences': { $all: user.preferences.lifestyle_preferences },
                $or: [
                    { 
                    'age': { $lte: user.preferences.ages_between[1] },
                    'age': { $gte: user.preferences.ages_between[0] }
                    }
                ],
                'preferences.looking_for_accommodation' : true
                }
            }
        ]);

        filteredUsers.push(...filteredGroups);

        if(!filteredUsers) {
            throw new ApiError(400, "Error getting filtered users list")
        }
        return res.status(201).json(
            new ApiResponse(200, filteredUsers)
        );

    } catch(e) {
        throw new ApiError(500, "Internal Server Error")
    }


}

export const getfilteredUsersList = async(req, res) => {

    try {

        const userId = req.params.userId; 
        if(!userId){
            throw new ApiError(400, "userId Required")
        }

        const userPreferencesDetails = req.body;
        const {looking_forBHK, zipcode, food_choices, profession, ages_between, budget, lifestyle_preferences} = userPreferencesDetails;

        const users = await User.find({}).select('-password -refreshToken');
        if(!users) {
            throw new ApiError(400, "Error getting users")
        }
        const user = await User.findById(userId).select('-password -refreshToken');
        if (!user) {
            throw new ApiError(404, "User not found")
        }
      
        const match = {
            'preferences.looking_for_accommodation' : true
        }
        if(looking_forBHK) {
            match["preferences.looking_forBHK"] = looking_forBHK
        }
        if(zipcode) {
            match["preferences.zipcode"] = zipcode
        }
        if(food_choices) {
            match["preferences.food_choices"] = food_choices
        }
        if(profession) {
            match["preferences.profession"] = profession
        }
        if(lifestyle_preferences && lifestyle_preferences.length > 0) {
            match["preferences.lifestyle_preferences"] = { $all: lifestyle_preferences }
        }

        if (ages_between && ages_between.length === 2 && ages_between.every(age => typeof age === 'number')) {
            match.$and = [
                { 'age': { $lte: ages_between[1] } },
                { 'age': { $gte: ages_between[0] } }
            ];
        }

        // const filteredUsers = await User.aggregate([
        //     {
        //         $match: {
        //         'preferences.looking_forBHK': looking_forBHK,
        //         'preferences.zipcode': zipcode,
        //         'preferences.food_choices': food_choices,
        //         'preferences.profession': profession,
        //         'preferences.budget': budget,
        //         'preferences.lifestyle_preferences': { $all: lifestyle_preferences },
        //         $and: [
        //             { 
        //             'age': { $lte: ages_between[1] },
        //             'age': { $gte: ages_between[0] }
        //             }
        //         ],
        //         'preferences.looking_for_accommodation' : true
        //         }
        //     }
        // ]);

        const filteredUsers = await User.aggregate([
            { $match: match }
        ]);

        if(!filteredUsers) {
            throw new ApiError(400, "Error getting filtered users list")
        }
        return res.status(201).json(
            new ApiResponse(200, filteredUsers)
        );
    } catch(e) {
        throw new ApiError(500, "Internal Server Error");
    }
}


export const loginUser = async(req, res) => {

    try{

        // console.log(req);
        const { username, password } = req.body;

        if(!username){
            return res.status(400).render('login_user',{error:"Username Required"});
  
        }

        if(!password){
            return res.status(400).render('login_user',{error:"Password Required"});
        }

        const user = await User.findOne({username});

        if(!user){
            return res.status(400).render('login_user',{error:"Invalid Username or Password"});

        }

        
        const isPasswordValid = await user.isPasswordCorrect(password);

        if(!isPasswordValid){
            return res.status(400).render('login_user',{error:"Invalid Username or Password"});
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

            //sending these to cookies

            const options = {
                httpOnly : true,
                secure : true
            }

            let checkingpreference = await User.findOne(
                { _id: user._id , 
                'preferences.budget': { $ne: null }});

            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .redirect('/explore')

        } catch(e) {
            return res.status(500).render('login_user',{error:"Internal Server Error"});
    }
}


export const logoutUser = async(req, res) => {
    if(!req.user.members){
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
    }else{
        await Group.findByIdAndUpdate(
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
    }

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .redirect('/')
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

//Same for matched User
export const getLikedUsers = async (req, res) => {
    try {
      const user = req.user;
      const likedUsersIds = await User.findById(user._id, { likes: 1, _id: 0 });
      const likedUsers = await User.find({ _id: { $in: likedUsersIds.likes } }, {
        refresh_token: 0,
        password: 0,
      });
      const userObj = JSON.stringify(user);

      return res.status(200).render('likedUserList', { likedUsers : likedUsers, userObj : userObj, isAuthenticated : req.user ? true : false });
    //   .json(
    //     new ApiResponse(
    //       200,
    //       {
    //         likedUsers: likedUsers,
    //       },
    //       `All the liked users by ${user.firstName}`
    //     )
    //   );
    } catch (error) {
      throw new ApiError(500, error?.message || "Error fetching liked users");
    }
  };


  export const getUserStatus = async (req, res) => {
    try {
      const userId = req.params.userId;
      const userStatus = await User.findById(userId).select('is_online');
      console.log(userStatus)
      return res.json(userStatus);
    } catch (error) {
      console.error(error);
      throw new ApiError(500, error?.message || "Error fetching user status users");

    //   return res.status(500).json({ message: 'Error fetching user status' });
    }
  };


// export const swipeRight = async(req, res) => {
//     const userId = req.params.likedBy;
//     let otherobjID=req.body.liked;
//     if (!(mongoose.Types.ObjectId.isValid(otherobjID) && mongoose.Types.ObjectId.isValid(userId))) {
//         throw new ApiError(401, "Invalid ObjectId String");
//       } 
//     let convobj= new mongoose.Types.ObjectId(otherobjID);
//     let convuserId= new mongoose.Types.ObjectId(userId);
//     let updatedUser = await User.findOneAndUpdate(
//         { _id: userId,likes:{ $ne: otherobjID } }, 
//         { $push: { likes: convobj }},
//         { new: true});
//     if(!updatedUser){
//         throw new ApiError(500, "Something wrong while swiping right the user.");
//     }
//     let checkingindislike = await User.findOneAndUpdate(
//         { _id: userId }, 
//         { $pull: { dislikes: convobj }},
//         { new: true});
//     console.log(checkingindislike);
//     let displaymesage="Liked";
//     //Checking in likedby Match
//     let existingmatch = await Match.findOne({
//         like:convobj,likedBy:convuserId
//     });
//     if(!existingmatch){
//         //Creating a like and likedby
//         existingmatch=await Match.create({ 
//             like:convobj,likedBy:convuserId
//         });
//     }
//    //Checking in like Match
//     let checkingmatch=await Match.findOne({
//         like:convuserId,likedBy:convobj
//     });
//    if(checkingmatch && existingmatch){
// //both present adding adding in likedby matches in user
//      let updatedmatch = await User.findOneAndUpdate(
//         { _id: userId,matches:{ $ne: otherobjID } }, 
//         { $push: { matches: convobj }},
//         { new: true});
//         if(updatedmatch){
//             updatedUser=updatedmatch;
//             displaymesage="Matched";
//         }
//    }
//     return res.status(201).json(
//         new ApiResponse(200, {data : displaymesage})
//     );

// }

// export const swipeLeft = async(req, res) => {
//     const userId = req.body.likedBy;
//     let otherobjID = req.body.liked;
//     if (!(mongoose.Types.ObjectId.isValid(otherobjID) && mongoose.Types.ObjectId.isValid(userId))) {
//         throw new ApiError(401, "Invalid ObjectId String");
//       } 
      
        
//     console.log(checkingpreference);
//     let convobj= new mongoose.Types.ObjectId(otherobjID);
//     let userobjID=new mongoose.Types.ObjectId(userId);
//     let checkinginlike = await User.findOneAndUpdate(
//         { _id: userId }, 
//         { $pull: { likes: convobj,matches:convobj }},
//         { new: true});
//     console.log(checkinginlike);
//     const updatedUser = await User.findOneAndUpdate(
//         { _id: userId,dislikes:{ $ne: otherobjID } }, 
//         { $push: { dislikes: convobj }},
//         { new: true});
//     if(!updatedUser){
//         throw new ApiError(500, "Something wrong while swiping Left the user.");
//     }
//     let displaymesage="Disliked"
//     return res.status(201).json(
//         new ApiResponse(200, {data:displaymesage})
//     );

// }

// export const checkingpreference = async(req, res) => {
//     const userId = req.params.userId;
//     if (!(mongoose.Types.ObjectId.isValid(userId))) {
//         throw new ApiError(401, "Invalid ObjectId String");
//       }
//     let checkingpreference = await User.findOne(
//         { _id: userId }, 
//         {preferences: { $ne: null }});
//     console.log(checkingpreference);

//     if(!updatedUser){
//         throw new ApiError(500, "Something wrong while swiping Left the user.");
//     }

//     return res.status(201).json(
//         new ApiResponse(200, updatedUser)
//     );

// }
