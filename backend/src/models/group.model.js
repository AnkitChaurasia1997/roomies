import mongoose from "mongoose";
import bcrypt from  "bcrypt";
import jwt from "jsonwebtoken";

const preferencesSchema = new mongoose.Schema({
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
    lifestyle_preferences : {
        type : [String],
        enum : ['Drinking', 'Smoking', 'Vegetarian', 'NonVegetarian', 'Pets', 'Cleanliness']
    },
    looking_for_accommodation : {
        type : Boolean,
        default : true,
        required : [true, "Can't be empty"]
    },
    budget : {
        type : Number
    },
})

const membersSchema = new mongoose.Schema({
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
    age:{
        type: Number,
        min: [18, "Age should be greater than 18"],
        max: 90,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : [true, "email can't be empty!"],
        trim : true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        validate: {
            validator: function(value) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
            },
            message: 'Invalid email address'
        }
    },
    gender : {
        type : String,
        required : [true, "gender can't be empty!"],
        trim : true,
    },
})

const groupSchema = new mongoose.Schema({
    name : {
        type :String,
        required : [true, "Group name can't be empty!"],
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
        required : [true, "Email is required!"],
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
    profile_picture : {
        type: String,
        required : [true, "Profile picture is required"],
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
    members : {
        type : [membersSchema]
    },
    preferences : {
        type : preferencesSchema,
    },
    likes:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    rejects:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    matches:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    refreshToken : {
        type: String
    },
    is_online: {
        type : Boolean,
        default : false
    },
}, {timestamps : true});


groupSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    return next();
});

//Methods Creation
groupSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
} 

groupSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            name : this.name
        },
        process.env.ACCESS_TOKEN_SECRET, 
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

groupSchema.methods.generateRefreshToken = function(){
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

export const Group = mongoose.model("Group", groupSchema);