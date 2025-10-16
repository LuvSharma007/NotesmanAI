import express from 'express'
import { chat } from '../controllers/chat.controler.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';


const router = express.Router();

router.post("/c",isAuthenticated,chat)

export default router;