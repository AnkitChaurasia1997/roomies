import { Router } from "express";

import { loginUser, logoutUser, registerUser, getProfile, setProfile, getNewRefreshToken,swipeRight,swipeLeft } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
    .route("/register")
    .post(upload.fields([
        {
            name:"profile_picture",
            maxCount : 1

        }
    ]), registerUser)

router
    .route("/login")
    .post(loginUser)

// secured route

router
    .route("/logout")
    .post(verifyJWT, logoutUser)


router
    .route("/refreshToken")
    .post(getNewRefreshToken);

router
    .route("/profile/:userId")
    .get(getProfile)

router
    .route("/profile/:userId")
    .post(setProfile)

router
    .route("/swipeRight/:userId")
    .post(swipeRight)

router
    .route("/swipeLeft/:userId")
    .post(swipeLeft)

router
    .route('/getLikedUsers')
    .get(verifyJWT, getLikedUsers)

router
    .route('/getUserStatus/:userId')
    .get(getUserStatus);


export default router;