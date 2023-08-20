import passport from 'passport';
import local from 'passport-local';
import { createHashPW,isValidPassword } from '../util/bcrypt.js';
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

  /*passport.use(
    'register',
    new LocalStrategy(
      {
        usernameField: 'consumidor.usuario.correoElectronico',
        passwordField: 'consumidor.usuario.contraseña',
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          const { consumidor } = req.body;
          consumidor.usuario.contraseña =password
          consumidor.usuario.correoElectronico =username
          const newUser = await userService.create(consumidor);
          return done(null, newUser);
        } catch (error) {
          return done(error, false, { message: 'Error en el registro.' });
        }
      }
    )
  );*/
  
  passport.use(
    'register',
    new LocalStrategy(
      {
        usernameField: 'consumidor.usuario.correoElectronico', // Accede al campo anidado
        passwordField: 'consumidor.usuario.contraseña', // Accede al campo anidado
        passReqToCallback: true, // Pasa la solicitud al callback
      },
      async (req, username, password, done) => {
        //try {
          const { consumidor } = req.body;
          //if (!consumidor.nombre || !consumidor.apellido || !consumidor.telefono || !consumidor.fechaNacimiento || !consumidor.dni || !consumidor.localidad || !consumidor.usuario || !consumidor.usuario.contraseña || !consumidor.usuario.nombreDeUsuario || !consumidor.usuario.correoElectronico) {
            //return res.status(200).json({error:'error al registrar'})
          //  console.log('Faltan datos');
          //  const error = new Error('Incomplete data provided.');
          //  return done(error, false, { message: 'Incomplete data provided.' });
          //}
  
          //if (userService.existeUsuario(username,username)) {
            //return res.status(200).json({error:'error al registrar'})
          //  console.log('User already exists');
          //  const error = new Error('User already exists.');
          //  return done(error, false, { message: 'User already exists.' });
          //}
          //try {
          const user = await userService.create(consumidor)
          //  console.log('User Registration successful');
          return done(null, user);
          //} catch (error) {
            //return res.status(200).json({error:'error al registrar'})
          //  console.log('error al crear.');
          //  return done(error, false, { message: 'error al crear.' });
          //}
          //next();
          
        //} catch (error) {
        //  console.log('Error in register');
        //  console.log(e);
        //  return done(e);
//}
      }
    )
  );

  /*passport.use(
    'register',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
      },
      async (req, username, password, done) => {
        try {
          const { firstName, lastName, age, email, password } = req.body;
          if (!firstName || !lastName || !age || !email || !password) {
            return res.status(400).render('error-page', { msg: 'faltan datos' });
          }
          let user = await UserModel.findOne({ email: username });
          if (user) {
            console.log('User already exists');
            return done(null, false);
          }
          let newuser = await UserModel.create({ firstName, lastName, age, email, password: createHash(password), rol: 'user' });
          console.log(newuser);
          console.log('User Registration succesful');
          return done(null, newuser);
        } catch (e) {
          console.log('Error in register');
          console.log(e);
          return done(e);
        }
      }
    )
  );*/


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
      console.error("Deserialize User Error:", err);
      done(err, null);
    }
  });
}