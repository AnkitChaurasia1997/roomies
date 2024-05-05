import { Router } from "express"
import { matchingLogic, rejectionLogic } from "../controllers/swipe.controller.js";


const router = Router();

router
    .route('/swipeRight')
    .post(matchingLogic)

router
    .route('/swipeLeft')
    .post(rejectionLogic)

export default router;
