import { Router } from "express";
import { registerGroup, setProfile, getProfile, loginUser, logoutUser, deleteGroup } from "../controllers/group.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { alreadyLoggedIn, ifLoginThenGo } from "../middlewares/authRoute.middleware.js";

const router = Router();

router
    .route("/register")
    .get(alreadyLoggedIn, async (req, res) => {
        res.render('register_group', {isAuthenticated : req.user ? true : false });
    })
    .post(upload.fields([
        {
            name:"profile_picture",
            maxCount : 1

        }
    ]), registerGroup)

router
    .route("/login")
    .get(alreadyLoggedIn, async (req, res) => {
        res.render('login_group', {isAuthenticated : req.user ? true : false });
    })
    .post(loginUser)

// secured route

router
    .route("/logout")
    .post(ifLoginThenGo,verifyJWT, logoutUser)


// router
//     .route("/refreshToken")
//     .post(getNewRefreshToken);



router
    .route("/profile/:userId")
    .post(ifLoginThenGo, setProfile)

router
    .route("/profile/:userId")
    .get(ifLoginThenGo, getProfile)

router
    .route('/delete')
    .get(ifLoginThenGo, verifyJWT, deleteGroup);

// router
//     .route("/swipeRight")
//     .post(swipeRight)

// router
//     .route("/swipeLeft")
//     .post(swipeLeft)

export default router;