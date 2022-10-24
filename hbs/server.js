// ---------------------------- Módulos ----------------------------
import express from 'express'
import exphbs from 'express-handlebars'
import path from 'path'
import session from 'express-session';
import dotenv from 'dotenv'
import connectMongo from 'connect-mongo'
import { createServer } from "http";
import { Server } from "socket.io";
import  ContenedorSQL  from './src/container/ContenedorSQL.js'
import ContenedorArchivo from './src/container/ContenedorArchivo.js';
import ContenedorMongoDb from './src/container/ContenedorMongoDb.js'; 
import UsuariosDaoMongoDb from './src/daos/UsuariosDaoMongoDB.js';
import config from './src/utils/config.js'
import {configSQ3} from './src/utils/configSQ3.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import generarObjetoRandom from './src/utils/objetoRandom.js';
import bcrypt from 'bcrypt'

import passport from "passport";
import { Strategy } from "passport-local";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config();

// ---------------------------- instancias del servidor ----------------------------
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });


//DB
const DB_USUARIOS = new UsuariosDaoMongoDb()

const DB_MENSAJES = new ContenedorArchivo('./DB/mensajes.json')

const DB_PRODUCTOS = new ContenedorSQL('productos', config.db)

// ---------------------------- Normalizacion Mensajes ----------------------------
import { normalize, schema } from 'normalizr'

const authorSchema = new schema.Entity('author', {}, {idAttribute: 'email'})

const mensajeSchema = new schema.Entity('post', { author: authorSchema}, {idAttribute: 'id'})

const mensajesSchema = new schema.Entity('posts', { mensajes: [mensajeSchema] }, {idAttribute: 'id'})

const normalizarMensajes = (msjConId) => normalize(msjConId, mensajesSchema)


// ---------------------------- session pers en mongo ----------------------------

const MongoStore = connectMongo.create({
    mongoUrl: process.env.MONGO_URL,
    
})


/*----------- passport -----------*/
const LocalStrategy = Strategy;
passport.use(new LocalStrategy(
    async function(username, password, done) {
        
        const existeUsuario = await DB_USUARIOS.getByEmail(username)
        
        
        if(!existeUsuario) {
            return done(null, false)
        } else {
            const match = await verifyPass(existeUsuario, password)
            if (!match) {
                return done(null, false)
            }
            return done(null, existeUsuario);
        }
    }
  ));

passport.serializeUser((user, done) =>{
    return done(null, user.email)
})

passport.deserializeUser(async (email, done) =>{
    const existeUsuario = await DB_USUARIOS.getByEmail(email)
    return done(null, existeUsuario)
})

//Session setup

app.use(session({
    store: MongoStore,
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 600000 //10 min
    }

    
}))
app.use(passport.initialize())
app.use(passport.session())


// ---------------------------- Middlewares ----------------------------
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));

//motor de plantillas
app.engine('hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: 'hbs'

}))
app.set('views', './views');
app.set('view engine', 'hbs');

function isAuth(req, res, next) {
    if(req.isAuthenticated()){
        next()
    } else {
        res.redirect('/login')
    }
}




//----------- metodos de auth -----------
async function generateHashPassword(password){
    const hashPassword = await bcrypt.hash(password, 10)
    return hashPassword
}

async function verifyPass(usuario, password){
    const match = await bcrypt.compare(password, usuario.password);
    return match
}   
// ---------------------------- Rutas ----------------------------
app.get('/', isAuth, async (req, res) => {
    console.log(`user ${req.user.email}`)
    const productos = await DB_PRODUCTOS.listarAll()
    const username = req.user.email
    return res.render('vista', {productos, username})
    
    
});

app.get('/login', async (req, res) =>{
    return res.render('login')
})

app.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect:'/login-error'} ))

app.get('/logout', async (req, res) => {
    const username = req.user.email
    req.logout(function(err) {
        if (err) { return next(err); }
        res.render('logout', {username})
      });
    
});

app.get('/register', async (req, res) => {
    return res.render('registro')
})

app.post('/register', async (req, res) => {
    const { email, password } = req.body
    const newUsuario = await DB_USUARIOS.getByEmail(email)
    console.log(newUsuario)
    if(newUsuario == undefined){
        DB_USUARIOS.save({ email, password: await generateHashPassword(password)}) 
        res.redirect('/login')
    } else {
       res.render('registro-error')
    }
    
})

app.get('/login-error', async (req, res) => {
    return res.render('login-error')
})

app.get('/api/productos-test', (req, res) => {
    const CANT_PROD = 5
    let objs = []

    for (let index = 0; index <= 5; index++){
        objs.push(generarObjetoRandom())
    }
    return res.render('testProductos', {objs})
})

// ---------------------------- Servidor ----------------------------
const PORT = 8080;

const server = httpServer.listen(PORT, () =>  {
    console.log('servidor corriendo en el puerto 8080');
    
} );

// ---------------------------- Websocket ----------------------------


io.on('connection', async (socket)=>{
    console.log(`Nuevo cliente conectado! ${socket.id}`);
    
    
    io.emit('from-server-mensajes', await listarMensajesNormalizados())

    socket.on('from-client-mensaje', async mensaje => {
        
        await DB_MENSAJES.save(mensaje);

        
        io.emit('from-server-mensajes', await listarMensajesNormalizados());
    })

    const productos = await DB_PRODUCTOS.listarAll()
    
    io.emit('from-server-productos', productos)

    socket.on('from-client-producto', async producto =>{
        
        DB_PRODUCTOS.insertar(await producto);
        
        io.emit('from-server-productos', productos)
    })
})

async function listarMensajesNormalizados() {
    const mensajesDB = await DB_MENSAJES.getAll()
    
    const normalizados = normalizarMensajes({id: 'mensajes', mensajesDB})
    

    return normalizados
}