import express from 'express'
import { chat, deleteChat } from '../controllers/chat.controler.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../lib/rateLimiter.js';

const router = express.Router();

router.post("/c/:conversationId",rateLimiter,isAuthenticated,chat)
router.delete("/deleteChat",rateLimiter,isAuthenticated,deleteChat)


export default router;