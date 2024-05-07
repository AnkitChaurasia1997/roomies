import { Group } from "../models/group.model.js";
import { User } from "../models/user.model.js";


export const viewProfilePage = async(req, res) => {
    try {
        const { userID } = req.params;

    let profileInfo

    profileInfo = await User.findById(userID).select("-password -refreshToken -likes -rejects -matches").lean();
    if(!profileInfo){
        profileInfo = await Group.findById(userID).select("-password -refreshToken -likes -rejects -matches").lean();
        return res.render('group_more_info', { profile: profileInfo, userID: req.user._id, layout: 'main', user: req.user || {}, isAuthenticated: req.user ? true : false, isGroup: req.user.members ? true : false });

    }
    // console.log(profileInfo);
    return res.render('user_more_info', { profile: profileInfo, userID: req.user._id, layout: 'main', user: req.user || {}, isAuthenticated: req.user ? true : false, isGroup: req.user.members ? true : false });
    } catch (error) {
        console.log(error);
    }
}