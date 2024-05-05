import { Group } from "../models/group.model.js";
import { User } from "../models/user.model.js";



export const preferenceController = async(req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('preferences') || await Group.findById(userId).populate('preferences');
        const preferences = user.preferences;

        // Get all users
        const allUsers = await User.find().select("-password -refreshToken") 
       // || await Group.find().select("-password -refreshToken");

        // Filter users based on preferences
        const filteredUsers = allUsers.filter(otherUser => {
            // Don't show the user themselves
            if (otherUser._id.toString() === userId.toString()) {
                return false;
            }

            // Check age range
            if (preferences.ages_between && (otherUser.age < preferences.ages_between[0] || otherUser.age > preferences.ages_between[1])) {
                return false;
            }

            // Check food choices
            if (preferences.food_choices && otherUser.preferences && otherUser.preferences.food_choices !== preferences.food_choices) {
                return false;
            }

            // Check profession
            if (preferences.profession && otherUser.preferences && otherUser.preferences.profession !== preferences.profession) {
                return false;
            }

            // Check lifestyle preferences
            if (preferences.lifestyle_preferences && otherUser.preferences && !otherUser.preferences.lifestyle_preferences.includes(preferences.lifestyle_preferences)) {
                return false;
            }

            // Check budget
            if (preferences.budget && otherUser.preferences && otherUser.preferences.budget > preferences.budget) {
                return false;
            }

            // Check if the user has liked, disliked, or matched the other user
            if (user.likes.includes(otherUser._id) || user.rejects.includes(otherUser._id) || user.matches.includes(otherUser._id)) {
                return false;
            }

            return true;
        });

        return res.render('explore', { profiles: filteredUsers, userID: req.user._id, layout: 'main' });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error occurred while fetching profiles');
    }
};


export const showPreferencesForm = async(req, res) => {
    return res.render('setPreferencesFirst', {layout : 'main'})
}


export const setPreferences = async(req, res) => {
    const userId = req.user._id;
    const preferences = req.body;
  
    if (req.user.members) {
      await Group.findByIdAndUpdate(userId, { $set: { preferences } }, { new: true });
    } else {
      await User.findByIdAndUpdate(userId, { $set: { preferences } }, { new: true });
    }
  
    return res.redirect('/preferences');
  };
