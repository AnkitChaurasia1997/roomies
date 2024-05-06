import { Group } from "../models/group.model.js";
import { User } from "../models/user.model.js";

function extractPreferences(preferences) {
    const extractedPreferences = {};
    Object.keys(preferences).forEach((key) => {
      if (preferences[key] !== null && preferences[key] !== undefined && preferences[key] !== '' && (Array.isArray(preferences[key]) ? preferences[key].length > 0 : true)) {
        extractedPreferences[key] = preferences[key];
      }
    });
    return extractedPreferences;
  }

  export const preferenceController = async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId).populate('preferences').lean() || await Group.findById(userId).populate('preferences').lean();
      const preferences = user.preferences;
      console.log("User Preferences")
      console.log(preferences);
  
      // Get all users
      const allUsers = await User.find().select("-password -refreshToken").lean() || await Group.find().select("-password -refreshToken").lean();
  
      // Extract non-empty preferences
      const extractedPreferences = extractPreferences(preferences);
  
      // Filter users based on extracted preferences
      const filteredUsers = allUsers.filter(otherUser => {
        // Don't show the user themselves
        if (otherUser._id.toString() === userId.toString()) {
          return false;
        }
  
        // Filter users based on extracted preferences
        for (const key in extractedPreferences) {
          if (otherUser.preferences && otherUser.preferences[key] && extractedPreferences[key] !== otherUser.preferences[key]) {
            return false;
          }
        }
  
        // Check if the user has liked, disliked, or matched the other user
        if (user.likes && user.likes.includes(otherUser._id) || user.rejects && user.rejects.includes(otherUser._id) || user.matches && user.matches.includes(otherUser._id)) {
            return false;
          }
  
        return true;
      });
  
      return res.render('explore', { profiles: filteredUsers, userID: req.user._id, layout: 'main', user: req.user || {}, isAuthenticated: req.user ? true : false });
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