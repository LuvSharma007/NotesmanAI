import express from 'express'
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {getAllUrls, getUrlStatus, initialUrlStatus, scrapeUrl} from "../controllers/url.controller.js"
import { rateLimiter } from '../lib/rateLimiter.js';
const router = express.Router();

router.post("/uploadUrl",rateLimiter,isAuthenticated,scrapeUrl)
router.get("/getAllUrls",rateLimiter,isAuthenticated,getAllUrls)
router.get("/url-initial-status/:id",rateLimiter,isAuthenticated,initialUrlStatus)
// SSE
router.get("/url-SSE/:id",rateLimiter,isAuthenticated,getUrlStatus)

export default router;