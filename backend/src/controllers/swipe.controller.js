import { Group } from "../models/group.model.js";
import { Match } from "../models/match.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const checkIfLiked = async (like, likedby) => {
    const document = await Match.findOne(
        { like: likedby, likedby: like }
    )
    if (document){
        return true
    }
    else{
        return false
    }
}

export const matchingLogic = async(req, res) => {
    try {
        const { like, likedby } = req.body;
        // console.log(req.body);

        const user1 = await User.findById(likedby);
        // console.log(user1);
        //the logic if the other guy has already the guy who swiped right
        // if ankit has already liked Ritik -- > then match;
        const isLiked = await checkIfLiked(like, likedby);

        if (isLiked){
            if(!req.user.members){
                await Promise.all([
                    User.findByIdAndUpdate(likedby, { $push: { matches: like } }),
                    User.findByIdAndUpdate(like, { $push: { matches: likedby }, $pull: { likes: likedby } }),
                  ]);
            }else{
                await Promise.all([
                    Group.findByIdAndUpdate(likedby, { $push: { matches: like } }),
                    Group.findByIdAndUpdate(like, { $push: { matches: likedby }, $pull: { likes: likedby } }),
                  ]);
            }
            return res.status(200).json(
                new ApiResponse(
                200,
                {
                    message : 'matched'
                },
                `This id ${likedby} this matched to ${like}`
            )
        )
        }
        // if Ritik is liking Ankit for the first time -- > then save in matches ;
        const newMatch = await Match.create({
            like : like,
            likedby : likedby
        })

        if(!newMatch){
            return res.status(500).send("something went wrong");
        }

        if(!req.user.members){
            await User.findByIdAndUpdate(likedby, { $push: { likes: like } });
        }else{
            await Group.findByIdAndUpdate(likedby, { $push: { likes: like } });
        }


        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    message : 'liked'
                },
                `This id ${likedby} this id ${like}`
            )
        )

    } catch (error) {
        console.log(error)
    }
}


export const rejectionLogic = async(req, res) => {
    try {
        const { like, likedby } = req.body;

        const reject = like;
        const rejectedby = likedby;

        if(!req.user.members){
            await User.findByIdAndUpdate(rejectedby, { $push: { rejects: reject } });
        }else{
            await Group.findByIdAndUpdate(rejectedby, { $push: { rejects: reject } });
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    message : 'rejected'
                },
                `This id ${rejectedby} rejected this ${reject}`
            )
        )
    } catch (error) {
        console.log(error)
    }
}