import express from 'express';
import { loginController } from '../controllers/login.controller.js';
import passport from 'passport';
export const RouterLogin = express.Router();

RouterLogin.post('/', passport.authenticate('login', { failureRedirect: '/login/faillogin' }), loginController.login);

RouterLogin.get('/faillogin', async (req, res) => {
  return res.json({ error: 'fail to login' });
});
