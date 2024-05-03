import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { dashboardController } from "../controllers/dashboard.controller.js";


const router  = Router();


router
    .route('/')
    .get((req, res) => {
        res.render('login', { layout: 'main' });
    })

router
    .route('/dashboard')
    .get(verifyJWT, dashboardController)

export default router;