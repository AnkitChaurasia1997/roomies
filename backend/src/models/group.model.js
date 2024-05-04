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
        required : [true, "Can't be empty"]
    }
})

const membersSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : [true, "first name can't be empty!"],
        index : true,
    },
    lastName : {
        type : String,
        required : [true, "last name can't be empty!"]
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
        trim : true
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
        lowercase : true
    },
    email : {
        type : String,
        required : [true, "Email is required!"],
        unique : true,
        trim : true,
    },
    password : {
        type : String,
        required : [true, 'Password is required']
    },
    profile_picture : {
        type: String,
        required : [true, "Profile picture is required"],
    },
    bio : {
        type : String
    },
    members : {
        type : [membersSchema]
    },
    budget : {
        type : Number
    },
    preferences : {
        type : preferencesSchema,
    },
    likes:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }],
    dislikes:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }],
    matches:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }],
    refreshToken : {
        type: String
    }
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