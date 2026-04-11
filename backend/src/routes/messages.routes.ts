import express from 'express'
import { getChats, getMessage, getSources } from '../controllers/messages.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../lib/rateLimiter.js';

const router = express.Router();

router.get("/getAllMessages",rateLimiter,isAuthenticated,getMessage)
router.get("/getAllSources",rateLimiter,isAuthenticated,getSources)
router.get("/getAllChats",rateLimiter,isAuthenticated,getChats)


export default router;