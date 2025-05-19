import express from 'express';
import { loginController } from '../controllers/AuthControllers.js';

const router = express.Router();

router.post('/login', loginController);

export default router;