import { Router } from "express";
import { registerGroup, setProfile, getProfile } from "../controllers/group.controller.js";
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
    ]), registerGroup)

// router
//     .route("/login")
//     .post(loginUser)

// // secured route

// router
//     .route("/logout")
//     .post(verifyJWT, logoutUser)


// router
//     .route("/refreshToken")
//     .post(getNewRefreshToken);

router
    .route("/profile/:userId")
    .post(setProfile)

router
    .route("/profile/:userId")
    .get(getProfile)


export default router;