import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { exploreController } from "../controllers/explore.controller.js";
import { matchedController } from "../controllers/match.controller.js";

const router  = Router();
router
    .route('/')
    .get((req, res) => {
        res.render('index'), {isAuthenticated : req.user ? true : false };
    })

router
    .route('/login')
    .get((req, res) => {
        res.render('login_selector', {isAuthenticated : req.user ? true : false });
    })

router
    .route('/register')
    .get((req, res) => {
        res.render('register', {isAuthenticated : req.user ? true : false });
    })

router
    .route('/showMatchedUsers')
    .get(verifyJWT, matchedController)

router
    .route('/explore')
    .get(verifyJWT, exploreController);

export default router;
