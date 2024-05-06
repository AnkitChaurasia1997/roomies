import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { exploreController } from "../controllers/explore.controller.js";
import { matchedController } from "../controllers/match.controller.js";
import { checkPreferences } from "../middlewares/pref.middleware.js";
import { logoutUser } from "../controllers/user.controller.js";
import { preferenceController, showPreferencesForm, setPreferences } from "../controllers/preference.controller.js";
import { routeCheck } from "../middlewares/authRoute.middleware.js";


const router  = Router();
router
    .route('/')
    .get((req, res) => {
        res.render('index'), {isAuthenticated : req.user ? true : false };
    })

router
    .route('/login')
    .get(routeCheck, (req, res) => {
        res.render('login_selector', {isAuthenticated : req.user ? true : false });
    })

router
    .route("/logout")
    .get(verifyJWT, logoutUser)

router
    .route('/register')
    .get((req, res) => {
        res.render('register', {isAuthenticated : req.user ? true : false });
    })

router
    .route('/showMatchedUsers')
    .get(verifyJWT, matchedController)

router
.route("/profile")
.get(verifyJWT, (req, res) => {
    // console.log(req.user);
    res.render('profile_user', {title : "Profile" , user : req.user || {}, isAuthenticated : req.user ? true : false });
})

router
    .route('/explore')
    .get(routeCheck, verifyJWT ,exploreController);


router
    .route('/setPreferences')
    .get(verifyJWT, showPreferencesForm)
    .post(verifyJWT, setPreferences);


router
    .route('/preferences')
    .get(verifyJWT,checkPreferences, preferenceController);


export default router;
