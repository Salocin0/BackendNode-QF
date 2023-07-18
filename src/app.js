import cookieParser from "cookie-parser";
import express from "express";
import { __dirname } from "./dirname.js"
import { connectDB } from './utils/connections.js';
import passport from 'passport';
import { iniPassport } from "./config/passport.config.js";
import { RouterUser } from "./routes/user.router.js";

const app = express();
const port = 8080;

connectDB();



app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(cookieParser());

iniPassport();
app.use(passport.initialize());
app.use(passport.session());

//para todo lo que este en public
app.use(express.static(__dirname + "/public"));

//urls
//app.use("/admin/", RouterAdmin);
app.use("/user/", RouterUser);
app.use("/acciones/", RouterUser);
app.use("/user/", RouterUser);
//app.use("/consumidor/", RouterConsumidor);
//app.use("/consumidor/", RouterConsumidor);
app.use("/user/login", RouterUser);
app.use("/user/recuperarcontrasenia", RouterUser);
app.use("/user/recuperarcontrasenia/:codigo", RouterUser);

//app.use("/api/products", routerProductos);
//app.use("/api/carts", routerCarts);
//app.use("/vista/realtimeproducts", routerVistaRealTimeProducts);
//app.use("/vista/cart", routerVistaCart);
//app.use("/api/users",routerUsers);
//app.use("/vista/products", routerVistaProducts)
//app.use('/', viewsRouter);
//app.use('/api/sessions', loginRouter);
//app.get("/api/sessions/github", passport.authenticate("github",{scope:["user:email"]}))

/*app.get('/api/sessions/githubcallback', passport.authenticate('github', { failureRedirect: '/error-autentificacion' }), (req, res) => {
  req.session.firstName = req.user.firstName;
  req.session.email = req.user.email;
  res.clearCookie('userId')
  res.cookie('userId', req.user._id, { maxAge: 3600000 });
  res.redirect('/vista/products');
});*/

/*app.get("/error-autentificacion",(req,res)=>{
  return res.status(400).render("error-page",{ msg: 'error al loguear' })
})*/

/*app.get('*', (req, res) => {
  return res.status(404).json({
    status: "Error",
    msg: "page not found",
    data: {},
  })
});*/

const httpServer = app.listen(port, () => {
  console.log('Servidor escuchando en el puerto ' + port);
});