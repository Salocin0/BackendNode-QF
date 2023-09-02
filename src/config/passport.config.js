import passport from 'passport';
import local from 'passport-local';
import { createHashPW, isValidPassword } from '../util/bcrypt.js';
import { Usuario } from '../DAO/models/users.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Op } from 'sequelize';
import { userService } from '../services/users.service.js';
import { repartidorService } from '../services/repartidor.service.js';
import { encargadoService } from '../services/encargado.service.js';
import { productorService } from '../services/productor.service.js';
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
          const { consumidor, encargado, repartidor, productor } = req.body;
          if (
            !consumidor.nombre ||
            !consumidor.apellido ||
            !consumidor.telefono ||
            !consumidor.fechaDeNacimiento ||
            !consumidor.dni ||
            !consumidor.localidad ||
            !consumidor.provincia ||
            !consumidor.usuario.contraseña ||
            !consumidor.usuario.nombreDeUsuario ||
            !consumidor.usuario.correoElectronico ||
            !consumidor.usuario.tipoUsuario
          ) {
            return done(null, false, req.flash('signupMessage', 'faltan datos.'));
          }
          try {
            if (consumidor.usuario.tipoUsuario === 'Repartidor') {
              const user = await userService.create(consumidor);
              const rep = await repartidorService.create(repartidor);
              user.consumidorCreado.repartidorId = rep.id;
              await user.consumidorCreado.save();
              return done(null, user.usuarioCreado.dataValues);
            } else if (consumidor.usuario.tipoUsuario === 'Productor') {
              const user = await userService.create(consumidor);
              const prod = await productorService.create(productor);
              user.consumidorCreado.productorId = prod.id;
              await user.consumidorCreado.save();
              return done(null, user.usuarioCreado.dataValues);
            } else if (consumidor.usuario.tipoUsuario === 'Encargado') {
              const user = await userService.create(consumidor);
              const enc = await encargadoService.create(encargado);
              user.consumidorCreado.encargadoId = enc.id;
              await user.consumidorCreado.save();
              return done(null, user.usuarioCreado.dataValues);
            } else {
              const user = await userService.create(consumidor);
              return done(null, user.usuarioCreado.dataValues);
            }
          } catch (error) {
            return done(null, false, req.flash('signupMessage', 'error al registrar', error));
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
