import express from 'express';
import { userController } from '../controllers/users.controller.js';
export const RouterUser = express.Router();

RouterUser.get('/', userController.getAllcontroller);

RouterUser.post('/session', userController.userSession);

RouterUser.get('/validarEmailUsuario/:id/:codigo', userController.validarEmail);

RouterUser.get('/habilitarUsuario/:id/:codigo', userController.habilitarUsuario);

RouterUser.get('/fail/register', async (req, res) => {
  const errorMessage = req.flash();
  res.status(200).json({ error: errorMessage });
});

RouterUser.get('/:id', userController.getOne);

RouterUser.post('/', userController.RegisterControler);

RouterUser.put('/recuperarcontrasenia', userController.recuperarContraseña);

RouterUser.put('/recuperarcontrasenia/:codigo', userController.recuperarContraseñaCodigo);

RouterUser.post('/update/:id/to/:rol', userController.updateRolController);

RouterUser.post('/habilitar', userController.habilitar);

RouterUser.put('/habilitar', userController.habilitarUsuario);

RouterUser.delete('/:id', userController.deshabilitarUsuario);
