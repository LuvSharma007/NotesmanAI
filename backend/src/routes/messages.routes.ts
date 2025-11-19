import express from 'express'
import { getMessage } from '../controllers/messages.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get("/getAllMessages",isAuthenticated,getMessage)

export default router;