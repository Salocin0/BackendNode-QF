import passport from 'passport';
import local from 'passport-local';
import { isValidPassword } from '../util/bcrypt.js'
import { Usuario } from '../DAO/models/users.model.js';
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
              [Op.or]: [
                { usuario: username },
                { email: username }
              ]
            }
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

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await Usuario.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

/*  passport.use(


    'github',
    new GitHubStrategy(
      {
        clientID: 'Iv1.32eaf723d820cff8',
        clientSecret: 'fcdabf303dfe016e7a57de6935a9be3eb1dbbda8',
        callbackURL: 'http://localhost:8080/api/sessions/githubcallback',
      },

      async (accesToken, _, profile, done) => {
        console.log(profile);
        try {
          const res = await fetch('https://api.github.com/user/emails', {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: 'Bearer ' + accesToken,
              'X-Github-Api-Version': '2022-11-28',
            },
          });
          const emails = await res.json();
          const emailDetail = emails.find((email) => email.verified == true);
          if (!emailDetail) {
            return done(new Error('cannot get a valid email for this user'));
          }
          profile.email = emailDetail.email;
          let user = await UserModel.findOne({ email: profile.email });
          if (!user) {
            const newUser = {
              email: profile.email,
              firstName: profile._json.name || profile._json.login || 'noname',
              lastName: 'nolast',
              password: 'nopass',
              rol:'Usuario'
            };
            let userCreated = await UserModel.create(newUser);
            console.log('User Registration succesful');
            return done(null, userCreated);
          } else {
            console.log('User already exists');
            return done(null, user);
          }
        } catch (e) {
          console.log('Error en auth github');
          console.log(e);
          return done(e);
        }
      }
    )
  );
*/

/*passport.use(
  'register',
  new LocalStrategy(
    {
      passReqToCallback: true,
      usernameField: 'email',
    },
    async (req, username, password, done) => {
      try {
        const { nombre, apellido, dni, localidad, usuario, fechaNacimiento, password } = req.body;


        if (!nombre || !apellido || !dni || !localidad || !usuario || !fechaNacimiento || !password) {
          return res.status(400).render('error-page', { msg: 'faltan datos' });
        }
        let user = await UserModel.findOne({ email: username });
        if (user) {
          console.log('User already exists');
          return done(null, false);
        }
      let newuser = await UserModel.create({ nombre, apellido, dni, localidad,usuario,fechaNacimiento, password:createHash(password)});
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