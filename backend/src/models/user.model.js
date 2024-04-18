import mongoose from "mongoose";
import bcrypt from  "bcrypt";
import jwt from "jsonwebtoken";

const preferencesSchema = new mongoose.Schema({
    userID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    looking_forBHK : {
        type : Number,
        required : [true, "Can't be empty!"]
    },
    zipcode : {
        type : Number,
        required : [true, "Can't be empty!"]
    },
    food_choices : {
        type : String,
        enum : ["vegetarian", "non-vegetarian"],
        required : [true, "Can't be empty!"]
    },
    profession : {
        type : String,
        enum : ["student", "working"],
        required : [true, "Can't be empty!"]
    },
    ages_between : {
        type : [Number],
        validate : function(value){
            return value[0] <= value[1]
        },
        message : "Invalid age range",
    },
    budget : {
        type : Number,
        required : [true, "Budget can't be empty!"]
    }, 
    lifestyle_preferences : [{
        type : [String],
        enum : ['Drinking', 'Smoking', 'Vegetarian', 'NonVegetarian', 'Pets', 'Cleanliness']
    }]
})

const userSchema = new mongoose.Schema({
    username : {
        type :String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true,
        lowercase : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
    },
    firstName : {
        type : String,
        required : true,
        index : true,
    },
    lastName : {
        type : String,
        required : true
    },
    bio : {
        type : String
    },
    age:{
        type: Number,
        min: [18, "Age should be greater than 18"],
        max: 90,
        required : true
    },
    profile_picture : {
        type: String,
        required : [true, "Profile picture is required"],
    },
    likes:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    password : {
        type : String,
        required : [true, 'Password is required']
    },
    preferences : {
        type : preferencesSchema,
    },
    refreshToken : {
        type: String
    }
}, {timestamps : true});


userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    return next();
});

//Methods Creation
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
} 

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username
        },
        process.env.ACCESS_TOKEN_SECRET, 
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET, 
        {
            expiresIn : process.env.REFRESH_TOKEN_SECRET_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);