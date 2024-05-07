import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { exploreController } from "../controllers/explore.controller.js";
import { matchedController } from "../controllers/match.controller.js";
import { checkPreferences } from "../middlewares/pref.middleware.js";
import { logoutUser } from "../controllers/user.controller.js";
import { preferenceController, showPreferencesForm, setPreferences } from "../controllers/preference.controller.js";
import { alreadyLoggedIn, ifLoginThenGo, routeCheck } from "../middlewares/authRoute.middleware.js";
import { viewProfilePage } from "../controllers/profile.controller.js";


const router  = Router();
router
    .route('/')
    .get(alreadyLoggedIn, (req, res) => {
        res.render('index'), {isAuthenticated : req.user ? true : false };
    })

router
    .route('/login')
    .get(alreadyLoggedIn, (req, res) => {
        res.render('login_selector', {isAuthenticated : req.user ? true : false });
    })

router
    .route("/logout")
    .get(ifLoginThenGo, verifyJWT, logoutUser)

router
    .route('/register')
    .get(alreadyLoggedIn, (req, res) => {
        res.render('register', {isAuthenticated : req.user ? true : false });
    })

router
    .route('/showMatchedUsers')
    .get(ifLoginThenGo, verifyJWT, matchedController)

router
.route("/profile")
.get(ifLoginThenGo ,verifyJWT, (req, res) => {
    console.log(req.user);
    if(req.user && req.user.name) {
        res.render('profile_group', {title : "Profile" , user : req.user || {}, isAuthenticated : req.user ? true : false });
    } else {
        res.render('profile_user', {title : "Profile" , user : req.user || {}, isAuthenticated : req.user ? true : false });
    }
})

router
    .route('/explore')
    .get(ifLoginThenGo ,verifyJWT, exploreController);

router
    .route('/profile/:userID')
    .get(ifLoginThenGo, verifyJWT ,viewProfilePage);


router
    .route('/setPreferences')
    .get(ifLoginThenGo, verifyJWT, showPreferencesForm)
    .post(ifLoginThenGo, verifyJWT, setPreferences);


router
    .route('/preferences')
    .get(ifLoginThenGo, verifyJWT,checkPreferences, preferenceController);


export default router;




