import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { dashboardController } from "../controllers/dashboard.controller.js";

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
    .route('/dashboard')
    .get(verifyJWT, dashboardController)

export default router;