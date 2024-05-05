import { Group } from "../models/group.model.js";
import { User } from "../models/user.model.js";

export const shuffleProfiles = async (profiles, username, currentUserId) => {
    // Get the current user's likes
    const currentUser = await User.findById(currentUserId) || await Group.findById(currentUserId);
    const likedUsers = currentUser.likes.map(like => like.toString());
    // const dislikedUsers = currentUser.rejects.map(reject => reject.toString());
    // const matchedUsers = currentUser.matches.map(match => match.toString());
    // Remove the user from the profiles array and users that the current user has liked
    const filteredProfiles = profiles.filter(profile => {
        return profile.username !== username && !likedUsers.includes(profile._id.toString()) 
        // && !dislikedUsers.includes(profile._id.toString()) && !matchedUsers.includes(profile._id.toString());
    });

    // Shuffle the array
    for (let i = filteredProfiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredProfiles[i], filteredProfiles[j]] = [filteredProfiles[j], filteredProfiles[i]];
    }

    return filteredProfiles;
};
  
export const exploreController = async(req, res) => {
    try {

        // const users = await User.find().select("-password -refreshToken");
        // const groups = await Group.find();
        // const profiles = [...users]; // concatenate the results
        const profiles = await User.find().select("-password -refreshToken");

        const username = req.user.username || req.user.name;
 
        const filteredProfiles = await shuffleProfiles(profiles, username, req.user._id);
        // console.log(filteredProfiles);
        return res.render('explore', { profiles : filteredProfiles, userID : req.user._id, isAuthenticated : req.user ? true : false });
      } catch (error) {
        console.error(error);
        return res.status(500).send('Error occurred while fetching profiles');
      }
    };
