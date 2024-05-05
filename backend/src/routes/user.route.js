import { Router } from "express";
import { loginUser, logoutUser, registerUser, getProfile, setProfile, getNewRefreshToken, getProfilesForUser, getfilteredUsersList, getUserStatus } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
    .route("/register")
    .get(async (req, res) => {
        res.render('register_user');
    })
    .post(upload.fields([
        {
            name:"profile_picture",
            maxCount : 1

        }
    ]), registerUser)

router
    .route("/login")
    .get((req, res) => {
        res.render('login_user', {isAuthenticated : req.user ? true : false });
    })
    .post(loginUser)

// secured route

router
    .route("/logout")
    .post(verifyJWT, logoutUser)


router
    .route("/refreshToken")
    .post(getNewRefreshToken);


router
.route("/profile")
.get(verifyJWT, (req, res) => {
    console.log(req.user);
    res.render('profile_user', {title : "Profile" , user : req.user || {}, isAuthenticated : req.user ? true : false });
})
.post(setProfile)

// router
//     .route("/profile/:userId")
//     .get(getProfile)

// router
//     .route("/profile/:userId")
//     .post(setProfile)

// router
//     .route("/swipeRight")
//     .post(swipeRight)

// router
//     .route("/swipeLeft")
//     .post(swipeLeft)

router
    .route("/profiles/get/:userId")
    .get(getProfilesForUser)

router
    .route("/filter/:userId")
    .get(getfilteredUsersList)

// router
//     .route('/getLikedUsers')
//     .get(verifyJWT, getLikedUsers)

router
    .route('/getUserStatus/:userId')
    .get(getUserStatus);

export default router;
