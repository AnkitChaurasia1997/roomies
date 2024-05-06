import { Group } from "../models/group.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const matchedController = async (req, res) => {
    try {
      const user = req.user;
      const matchedUsersIds = await User.findById(user._id, { matches: 1, _id: 0 }) || await Group.findById(user._id, { matches: 1, _id: 0 });
      const matchedProfiles = await Promise.all(matchedUsersIds.matches.map(async (id) => {
        const doc = (await User.findById(id).lean()) || (await Group.findById(id).lean());
        if (doc.members) {
          return { ...doc, username: doc.name };
        }
        return doc;
      }));

      // console.log(matchedProfiles);
      const userObj = JSON.stringify(user);

      return res.status(200).render('matchedUserList', { matchedUsers : matchedProfiles, userObj : userObj, isAuthenticated : req.user ? true : false });
    //   .json(
    //     new ApiResponse(
    //       200,
    //       {
    //         likedUsers: likedUsers,
    //       },
    //       `All the liked users by ${user.firstName}`
    //     )
    //   );
    } catch (error) {
      throw new ApiError(500, error?.message || "Error fetching matched users");
    }
  };
