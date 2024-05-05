import { User } from "../models/user.model.js";


export const matchedController = async (req, res) => {
    try {
      const user = req.user;
      const matchedUsersIds = await User.findById(user._id, { matches: 1, _id: 0 });
      const matchedUsers = await User.find({ _id: { $in: matchedUsersIds.matches } }, {
        refresh_token: 0,
        password: 0,
      });
      const userObj = JSON.stringify(user);

      return res.status(200).render('matchedUserList', { matchedUsers : matchedUsers, userObj : userObj });
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
