import express from 'express'
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {scrapeUrl} from "../controllers/url.controller.js"
const router = express.Router();

router.post("/getUrl",isAuthenticated,scrapeUrl)

export default router;