import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
    .route("/register")
    .post(upload.fields([
        {
            name:"profile_picture",
            maxCount : 1

        }
    ]), registerUser)

// router
//     .route("/login")
//     .post(loginUser)

// //secured route

// router
//     .route("/logout")
//     .post(verifyJWT, logoutUser)


// router
//     .route("/refreshToken")
//     .post(getNewToken);


export default router;