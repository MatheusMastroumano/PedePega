import express from 'express';
import { loginController, registerController } from '../controllers/AuthControllers.js';

const router = express.Router();

//Rotas de registro e login
router.post('/register', registerController)
router.post('/login', loginController);

export default router;