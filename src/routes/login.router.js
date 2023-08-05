import express from 'express';
export const RouterLogin = express.Router();
import { loginController } from '../controllers/login.controller.js';

RouterLogin.post('/', loginController.login);
