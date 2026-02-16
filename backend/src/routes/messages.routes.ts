import express from 'express'
import { getMessage } from '../controllers/messages.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../lib/rateLimiter.js';

const router = express.Router();

router.get("/getAllMessages",rateLimiter,isAuthenticated,getMessage)

export default router;