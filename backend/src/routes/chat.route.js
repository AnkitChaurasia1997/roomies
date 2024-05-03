import { Router } from "express";
import { saveChat } from "../controllers/chat.controller.js";


const router = Router();


router
    .route('/save-chat')
    .post(saveChat)


export default router;