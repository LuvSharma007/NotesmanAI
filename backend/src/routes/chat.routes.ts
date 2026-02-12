import express from 'express'
import { chat } from '../controllers/chat.controler.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../lib/rateLimiter.js';

const router = express.Router();

router.post("/c/:id",rateLimiter,isAuthenticated,chat)

export default router;