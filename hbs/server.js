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
import minimist from 'minimist';
import process, { execPath } from 'process';
import passport from "passport";
import { Strategy } from "passport-local";
import util from 'util'
import routerRandoms from './src/routes/randoms.routes.js';
import cluster from 'cluster';
import os from 'os'
import { normalize, schema } from 'normalizr'
import { exec } from 'child_process';
import compression from 'compression';
import {logger} from './src/utils/logger.config.js';
import morgan from 'morgan';


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config();

// ---------------------------- instancias del servidor ----------------------------
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

const CPU_CORES = os.cpus().length 
// ---------------------------- MINIMIST ----------------------------
let options = {alias: { p: 'port', m: 'modo'}, default:{p: 8080, m: 'fork' }}
let args = minimist(process.argv.slice(2), options)
console.log(args.m)
const PORT = args.p;
let MODO = args.m;
export default PORT;


if(cluster.isPrimary && MODO === 'cluster'){
    
    for (let i = 0; i < CPU_CORES; i++) {
        cluster.fork();
    }
} else {
    //DB
    const DB_USUARIOS = new UsuariosDaoMongoDb()

    const DB_MENSAJES = new ContenedorArchivo('./DB/mensajes.json')

    const DB_PRODUCTOS = new ContenedorSQL('productos', config.db)

    // ---------------------------- Normalizacion Mensajes ----------------------------



    const authorSchema = new schema.Entity('author', {}, {idAttribute: 'email'})

    const mensajeSchema = new schema.Entity('post', { author: authorSchema}, {idAttribute: 'id'})

    const mensajesSchema = new schema.Entity('posts', { mensajes: [mensajeSchema] }, {idAttribute: 'id'})

    const normalizarMensajes = (msjConId) => normalize(msjConId, mensajesSchema)


    // ---------------------------- session pers en mongo ----------------------------

    const MongoStore = connectMongo.create({
        mongoUrl: process.env.MONGO_URL_SESSIONS,
        
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

    let logInfo = {
        write: function (text) {
            logger.info(text);
        }
    };
    
    app.use(morgan('combined', { stream: logInfo }));
    
    let logErrors = {
        write: function (text) {
            logger.error(text);
        }
    };
    morgan('combined', { 
        stream: logErrors,
        skip: function (req, res) { return res.statusCode < 400}
      })


    //----------- metodos de auth -----------
    async function generateHashPassword(password){
        const hashPassword = await bcrypt.hash(password, 10)
        return hashPassword
    }

    async function verifyPass(usuario, password){
        const match = await bcrypt.compare(password, usuario.password);
        return match
    }   

    // app.use('/api/randoms', routerRandoms);

    // ---------------------------- Rutas ----------------------------
    app.get('/', isAuth, async (req, res) => {
  
        // const { url, method } = req
        // logger.info(`Ruta: ${url}, metodo: ${method}`)
        const productos = await DB_PRODUCTOS.listarAll()
        const username = req.user.email
            
        return res.render('vista', {productos, username}) 
        
    });

    app.get('/login', async (req, res) =>{
        // const { url, method } = req
        // logger.info(`Ruta: ${url}, metodo: ${method}`)
        console.log(`Ruta especial en ${PORT} - PID ${process.pid} - ${new Date().toLocaleString()}`)
        return res.render('login')
    })

    app.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect:'/login-error'} ))

    app.get('/logout', async (req, res) => {
        const username = req.user.email
        // const { url, method } = req
        // logger.info(`Ruta: ${url}, metodo: ${method}`)
        req.logout(function(err) {
            if (err) { return next(err); }
            res.render('logout', {username})
        });
        
    });

    app.get('/register', async (req, res) => {
        // const { url, method } = req
        // logger.info(`Ruta: ${url}, metodo: ${method}`)
        return res.render('registro')
    })

    app.post('/register', async (req, res) => {
        // const { url, method } = req
        // logger.info(`Ruta: ${url}, metodo: ${method}`)
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
        // const { url, method } = req
        // logger.info(`Ruta: ${url}, metodo: ${method}`)
        return res.render('login-error')
    })

    app.get('/api/productos-test', (req, res) => {
        // const { url, method } = req
        // logger.info(`Ruta: ${url}, metodo: ${method}`)
        const CANT_PROD = 5
        let objs = []

        for (let index = 0; index <= 5; index++){
            objs.push(generarObjetoRandom())
        }
        return res.render('testProductos', {objs})
    });

    app.get('/info', compression(), async (req, res) => {
        // const { url, method } = req
        // logger.info(`Ruta: ${url}, metodo: ${method}`)
        function print(obj) {
            const argumentos = util.inspect(obj, {showHidden: false, depth: 12, colors: true})
            
            return argumentos
        }
        const processInfo = {
            directory: process.cwd(),
            processId: process.pid,
            nodeVersion: process.version,
            operatingSistem: process.platform,
            memoryUsage: process.memoryUsage.rss(),
            entryArgs: print(args),
            cpuNumber: CPU_CORES,
            pathEjecucion: process.execPath,
        }
        console.log(processInfo)
        return res.render('info', {processInfo})
    })

    // app.get('*', (req, res) => {
    //     const { url, method } = req
    //     // logger.warn(`Ruta ${method} ${url} no implementada`)
    //     res.send(`Ruta ${method} ${url} no está implementada`)
    // })
    





    // ---------------------------- Servidor ----------------------------c

        const server = httpServer.listen(PORT, () =>  {
        console.log(`servidor corriendo en el puerto ${PORT} - PID Worker ${process.pid}`)
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

}