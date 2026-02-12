import express from 'express'
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {getAllUrls, scrapeUrl} from "../controllers/url.controller.js"
import { rateLimiter } from '../lib/rateLimiter.js';
const router = express.Router();

router.post("/uploadUrl",rateLimiter,isAuthenticated,scrapeUrl)
router.get("/getAllUrls",rateLimiter,isAuthenticated,getAllUrls)

export default router;