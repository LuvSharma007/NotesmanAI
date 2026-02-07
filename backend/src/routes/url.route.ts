import express from 'express'
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {getAllUrls, scrapeUrl} from "../controllers/url.controller.js"
const router = express.Router();

router.post("/uploadUrl",isAuthenticated,scrapeUrl)
router.get("/getAllUrls",isAuthenticated,getAllUrls)

export default router;