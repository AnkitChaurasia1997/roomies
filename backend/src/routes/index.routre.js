import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { exploreController } from "../controllers/explore.controller.js";
import { matchedController } from "../controllers/match.controller.js";

const router  = Router();
router
    .route('/')
    .get((req, res) => {
        res.render('index');
    })

router
    .route('/login')
    .get((req, res) => {
        res.render('login_selector');
    })

router
    .route('/register')
    .get((req, res) => {
        res.render('register');
    })

router
    .route('/showMatchedUsers')
    .get(verifyJWT, matchedController)

router
    .route('/explore')
    .get(verifyJWT, exploreController);

export default router;
