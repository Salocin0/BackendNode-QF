import passport from 'passport';
import local from 'passport-local';
import { createHashPW, isValidPassword } from '../util/bcrypt.js';
import { Usuario } from '../DAO/models/users.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Op } from 'sequelize';
import { userService } from '../services/users.service.js';
const LocalStrategy = local.Strategy;

export function initPassport() {
  passport.use(
    'login',
    new LocalStrategy(
      {
        usernameField: 'correoElectronico',
        passwordField: 'contraseña',
      },
      async (username, password, done) => {
        if (!username || !password) {
          return done(null, false);
        }
        try {
          const user = await Usuario.findOne({
            where: {
              [Op.or]: [{ usuario: username }, { email: username }],
            },
          });
          if (!user) {
            console.log('User Not Found with username or email: ' + username);
            return done(null, false);
          }
          if (!isValidPassword(password, user.contraseña)) {
            console.log('Invalid Password');
            return done(null, false);
          }
          return done(null, user);
        } catch (err) {
          console.log(err);
          return done(err);
        }
      }
    )
  );

  passport.use(
    'local-signup',
    new LocalStrategy(
      {
        usernameField: 'correoElectronico',
        passwordField: 'contraseña',
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const { consumidor } = req.body;
          if (
            !consumidor.nombre ||
            !consumidor.apellido ||
            !consumidor.telefono ||
            !consumidor.fechaDeNacimiento ||
            !consumidor.dni ||
            !consumidor.localidad ||
            !consumidor.usuario.contraseña ||
            !consumidor.usuario.nombreDeUsuario ||
            !consumidor.usuario.correoElectronico
          ) {
            return done(null, false, req.flash('signupMessage', 'faltan datos.'));
          }
          try {
            const user = await userService.create(consumidor);
            return done(null, user.usuarioCreado.dataValues);
          } catch (error) {
            return done(null, false, req.flash('signupMessage', 'error al registrar'));
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser(async (user, done) => {
      done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await userService.getOne(id);
      if (!user) {
        return done(new Error('User not found'), null);
      }
      done(null, user);
    } catch (err) {
      console.error('Deserialize User Error:', err);
      done(err, null);
    }
  });
}