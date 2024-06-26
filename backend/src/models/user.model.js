import mongoose from "mongoose";
import bcrypt from  "bcrypt";
import jwt from "jsonwebtoken";

const preferencesSchema = new mongoose.Schema({
    looking_forBHK : {
        type : Number,
        required : [true, "Can't be empty!"]
    },
    zipcode : {
        type : String,
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
    lifestyle_preferences : {
        type : [String]
    },
    looking_for_accommodation : {
        type : Boolean,
        default : true
        // required : [true, "Can't be empty"]
    }
})

export const userSchema = new mongoose.Schema({
    username : {
        type :String,
        required : [true, "username can't be empty!"],
        unique : true,
        lowercase : true,
        trim : true,
        index : true,
        match: /^[a-zA-Z]{5,10}$/,
        validate: {
            validator: function(value) {
                return /^[a-zA-Z]+$/.test(value); // No numbers
            },
            message: 'Invalid username (5-10 characters, no numbers)'
        }
    },
    email : {
        type : String,
        required : [true, "email can't be empty!"],
        unique : true,
        trim : true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        validate: {
            validator: function(value) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
            },
            message: 'Invalid email address'
        }
    },
    firstName : {
        type : String,
        required : [true, "first name can't be empty!"],
        index : true,
        match: /^[a-zA-Z]{2,25}$/,
        validate: {
            validator: function(value) {
                return /^[a-zA-Z]+$/.test(value); // No numbers
            },
            message: 'Invalid first name (2-25 characters, no numbers)'
        }
    },
    lastName : {
        type : String,
        required : [true, "last name can't be empty!"],
        match: /^[a-zA-Z]{2,25}$/,
        validate: {
            validator: function(value) {
                return /^[a-zA-Z]+$/.test(value); // No numbers
            },
            message: 'Invalid last name (2-25 characters, no numbers)'
        }
    },
    bio : {
        type : String,
        maxlength: 500,
        validate: {
            validator: function(value) {
                return value.length <= 500;
            },
            message: 'Bio cannot exceed 500 characters'
        }
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
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'likesType'
      }],
      matches: [{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'matchesType'
      }],
      rejects: [{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'rejectsType'
      }],
      likesType: {
        type: String,
        enum: ['User', 'Group']
      },
      matchesType: {
        type: String,
        enum: ['User', 'Group']
      },
      rejectsType: {
        type: String,
        enum: ['User', 'Group']
      },
    password : {
        type : String,
        required : [true, 'Password is required'],
        validate: {
            validator: function(value) {
                return /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(value);
            },
            message: 'Invalid password (at least 8 characters with uppercase, number, special character)'
        }
    },
    preferences : {
        type : preferencesSchema
    },
    refreshToken : {
        type: String
    },
    is_online: {
        type : Boolean,
        default : false
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
