import { User } from '../models/user.model.js';

export const checkPreferences = async (req, res, next) => {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('preferences');
  
    if (!user.preferences || 
        (user.preferences.ages_between.length === 0 && 
         user.preferences.lifestyle_preferences.length === 0)) {
      return res.redirect('/setPreferences');
    }
  
    next();
  };
