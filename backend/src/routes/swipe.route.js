import { Router } from "express"
import { matchingLogic, rejectionLogic } from "../controllers/swipe.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router
    .route('/swipeRight')
    .post(verifyJWT, matchingLogic)

router
    .route('/swipeLeft')
    .post(verifyJWT, rejectionLogic)

export default router;