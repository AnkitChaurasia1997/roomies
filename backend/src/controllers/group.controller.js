import { ApiError } from "../utils/ApiError.js";
import { Group } from "../models/group.model.js";
import { isObjectValid } from "../utils/Validator.js";
import uploadOnCDN from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


export const registerGroup = async(req, res) => {

    try{
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

    } catch(e) {
        throw new ApiError(500, "Internal Server Error");
    }
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

export const getfilteredGroupList = async(req, res) => {

    try {

        const userId = req.params.userId; 
        if(!userId){
            throw new ApiError(400, "userId Required")
        }

        const userPreferencesDetails = req.body;
        const {looking_forBHK, zipcode, food_choices, profession, ages_between, budget, lifestyle_preferences} = userPreferencesDetails;

        const groups = await Group.find({}).select('-password -refreshToken');
        if(!groups) {
            throw new ApiError(400, "Error getting groups")
        }
        const group = await Group.findById(userId).select('-password -refreshToken');
        if (!group) {
            throw new ApiError(404, "Group not found")
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

        const filteredGroups = await Group.aggregate([
            { $match: match }
        ]);

        if(!filteredGroups) {
            throw new ApiError(400, "Error getting filtered groups list")
        }
        return res.status(201).json(
            new ApiResponse(200, filteredGroups)
        );
    } catch(e) {
        throw new ApiError(500, "Internal Server Error");
    }
}

export const getProfilesForGroup = async(req, res) => {

    try {

        const userId = req.params.userId; 
        if(!userId){
            throw new ApiError(400, "userId Required")
        }
        const groups = await Group.find({}).select('-password -refreshToken');
        if(!groups) {
            throw new ApiError(400, "Error getting groups")
        }

        const group = await Group.findById(userId).select('-password -refreshToken');
        if (!group) {
            throw new ApiError(404, "Group not found")
        }

        const filteredUsers = await User.aggregate([
            {
                $match: {
                'preferences.looking_forBHK': group.preferences.looking_forBHK,
                'preferences.zipcode': group.preferences.zipcode,
                'preferences.food_choices': group.preferences.food_choices,
                'preferences.profession': group.preferences.profession,
                'preferences.budget': group.preferences.budget,
                'preferences.lifestyle_preferences': { $all: group.preferences.lifestyle_preferences },
                $or: [
                    { 
                    'age': { $lte: group.preferences.ages_between[1] },
                    'age': { $gte: group.preferences.ages_between[0] }
                    }
                ],
                'preferences.looking_for_accommodation' : true
                }
            }
        ]);

        const filteredGroups = await Group.aggregate([
            {
                $match: {
                'preferences.looking_forBHK': group.preferences.looking_forBHK,
                'preferences.zipcode': group.preferences.zipcode,
                'preferences.food_choices': group.preferences.food_choices,
                'preferences.profession': group.preferences.profession,
                'preferences.budget': group.preferences.budget,
                'preferences.lifestyle_preferences': { $all: group.preferences.lifestyle_preferences },
                $or: [
                    { 
                    'age': { $lte: group.preferences.ages_between[1] },
                    'age': { $gte: group.preferences.ages_between[0] }
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

export const setProfile = async(req, res) => {

    try{
        const userId = req.params.userId; 
        if(!userId){
            throw new ApiError(400, "userId Required")
        }
        
        const groupDetails = req.body;
        const {name, email, firstName, lastName, bio, looking_forBHK, zipcode, food_choices, profession, ages_between, budget, lifestyle_preferences, looking_for_accommodation, members} = groupDetails;

        const group = await Group.findById(userId).select('-password -refreshToken');
        if (!group) {
            throw new ApiError(404, "Group not found")
        }
            
        
        let updatedObj = {
            name : name,
            email : email,
            firstName : firstName,
            lastName : lastName,
            bio : bio,
            members : members ? members : [],
            likes : group.likes ? group.likes : [],
            dislikes : group.dislikes ? group.dislikes : []
        }

        let updatedPreferences = {}

        if(group.preferences) {
            if(looking_forBHK) {
                updatedPreferences["looking_forBHK"] = looking_forBHK;
            } else {
                updatedPreferences["looking_forBHK"] = group.preferences.looking_forBHK;
            }
            if(zipcode) {
                updatedPreferences["zipcode"] = zipcode;
            } else {
                updatedPreferences["zipcode"] = group.preferences.zipcode;
            }
            if(food_choices) {
                updatedPreferences["food_choices"] = food_choices;
            } else {
                updatedPreferences["food_choices"] = group.preferences.food_choices;
            }
            if(profession) {
                updatedPreferences["profession"] = profession;
            } else {
                updatedPreferences["profession"] = group.preferences.profession;
            }
            if(ages_between) {
                updatedPreferences["ages_between"] = ages_between;
            } else {
                updatedPreferences["ages_between"] = group.preferences.ages_between;
            }
            if(budget) {
                updatedPreferences["budget"] = budget;
            } else {
                updatedPreferences["budget"] = group.preferences.budget;
            }
            if(lifestyle_preferences) {
                updatedPreferences["lifestyle_preferences"] = lifestyle_preferences;
            } else {
                updatedPreferences["lifestyle_preferences"] = group.preferences.lifestyle_preferences;
            }
            if(looking_for_accommodation) {
                updatedPreferences["looking_for_accommodation"] = looking_for_accommodation;
            } else {
                updatedPreferences["looking_for_accommodation"] = group.preferences.looking_for_accommodation;
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

        if(group.preferences) {
            for (const key in groupDetails) {
                if (Object.hasOwnProperty.call(groupDetails, key)) {
                    if (Object.keys(group.preferences).includes(key)) {
                        updatedObj[preferences].key = groupDetails[key];
                    }
                }
            }
        }


        
        for (const key in groupDetails) {
            if (Object.hasOwnProperty.call(groupDetails, key)) {
                if (group.schema.path(key)) {
                    updatedObj[key] = groupDetails[key];
                }
            }
        }

        const updatedGroup = await Group.findByIdAndUpdate(userId, updatedObj, { new: true });

        if(!updatedGroup){
            throw new ApiError(500, "Something went wrong while updating the Group.");
        }

        return res.status(201).json(
            new ApiResponse(200, updatedGroup, "Group profile updated successfully")
        )

    } catch(e) {
        throw new ApiError(500, "Internal Server Error")
    }

}

export const getProfile = async(req, res) => {

    try{
        let userId = req.params.userId;
        if(!userId){
            throw new ApiError(400, "userId Required")
        }
        const group = await Group.findById(userId).select('-password -refreshToken');

        if(!group){
            throw new ApiError(500, "Something went wrong while getting the group.");
        }

        return res.status(201).json(
            new ApiResponse(200, group)
        )
    } catch(e) {
        throw new ApiError(500, "Internal Server Error")
    }

}