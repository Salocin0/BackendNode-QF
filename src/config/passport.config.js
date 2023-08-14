import passport from 'passport';
import local from 'passport-local';
import { createHashPW,isValidPassword } from '../util/bcrypt.js';
import { Usuario } from '../DAO/models/users.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Op } from 'sequelize';
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
    'register',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'correoElectronico',
      },
      async (req, username, password, done) => {
        try {
          const { consumidor } = req.body;
  
          if (!consumidor.nombre || !consumidor.apellido || !consumidor.telefono || !consumidor.fechaNacimiento || !consumidor.dni || !consumidor.localidad || !consumidor.usuario || !consumidor.usuario.contraseña || !consumidor.usuario.nombreDeUsuario || !consumidor.usuario.correoElectronico) {
            console.log('Faltan datos');
            return done(null, false, { message: 'Incomplete data provided.' });
          }
          
          const user = await Usuario.findOne({
            where: {
              [Op.or]: [{ usuario: username }, { email: username }],
            },
          });
          if (user) {
            console.log('User already exists');
            return done(null, false, { message: 'User already exists.' });
          }
          
          const newuser = {
            contraseña: createHashPW(consumidor.usuario.contraseña),
            usuario: consumidor.usuario.nombreDeUsuario,
            email: consumidor.usuario.correoElectronico,
            fechaAlta: Date.now(),
          };
          
          const usuarioCreado = await Usuario.create(newuser);
          const consum = {
            nombre: consumidor.nombre,
            apellido: consumidor.apellido,
            dni: consumidor.dni,
            localidad: consumidor.localidad,
            telefono: consumidor.telefono,
            fechaNacimiento: consumidor.fechaDeNacimiento,
            usuarioId: usuarioCreado.id,
          };
          
          const consumidorCreado = await Consumidor.create(consum);
          usuarioCreado.consumidoreId = consumidorCreado.id;
          await usuarioCreado.save();
          
          console.log('User Registration successful');
          return done(null, usuarioCreado);
        } catch (e) {
          console.error('Error in register', e);
          return done(e, false, { message: 'An error occurred during registration.' });
        }
      }
    )
  );
  

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      let user = await Usuario.findByPk(id);
      if (!user) {
        return done(new Error('User not found'), null);
      }
      done(null, user);
    } catch (err) {
      console.error("Deserialize User Error:", err); // Muestra el error en la consola
      done(err, null);
    }
  });
}