import express from 'express';
import { loginController } from '../controllers/AuthControllers.js';

const router = express.router();

router.post('/login', loginController);

export default router;