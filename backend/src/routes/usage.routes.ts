import express from 'express'
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../lib/rateLimiter.js';
import { userUsage } from '../controllers/usage.controller.js';

const router = express.Router();

router.get("/getUsage",rateLimiter,isAuthenticated,userUsage)

export default router;