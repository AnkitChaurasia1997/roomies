import { User } from "../models/user.model.js";

export const shuffleProfiles = (profiles, username) => {
    // Remove the user from the profiles array
    const filteredProfiles = profiles.filter(profile => {
        return profile.username !== username;
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

        const filteredProfiles = shuffleProfiles(profiles, username);
        console.log(filteredProfiles);
        return res.render('explore', { profiles : filteredProfiles, userID : req.user._id });
      } catch (error) {
        console.error(error);
        return res.status(500).send('Error occurred while fetching profiles');
      }
    };
