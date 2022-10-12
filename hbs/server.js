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
import {config}  from './src/utils/config.js'
import {configSQ3} from './src/utils/configSQ3.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import generarObjetoRandom from './src/utils/objetoRandom.js';
import ContenedorArchivo from './src/container/ContenedorArchivo.js';
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config();

// ---------------------------- instancias del servidor ----------------------------
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });


//DB
// const contenedor = new Contenedor('./DB/productos.json')

const DB_MENSAJES = new ContenedorArchivo('./DB/mensajes.json')

const DB_PRODUCTOS = new ContenedorSQL('productos', config)

// ---------------------------- Normalizacion Mensajes ----------------------------
import { normalize, schema } from 'normalizr'

const authorSchema = new schema.Entity('author', {}, {idAttribute: 'email'})

const mensajeSchema = new schema.Entity('post', { author: authorSchema}, {idAttribute: 'id'})

const mensajesSchema = new schema.Entity('posts', { mensajes: [mensajeSchema] }, {idAttribute: 'id'})

const normalizarMensajes = (msjConId) => normalize(msjConId, mensajesSchema)


// ---------------------------- session pers en mongo ----------------------------

const MongoStore = connectMongo.create({
    mongoUrl: process.env.MONGO_URL,
    ttl: 60
})

//Session setup

app.use(session({
    store: MongoStore,
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true
}))



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





// ---------------------------- Rutas ----------------------------
app.get('/', async (req, res) => {
    if (!req.session.nombre) {
        
        res.redirect('/login')
    
    } else {
        const productos = await DB_PRODUCTOS.listarAll()
        const username = req.session.nombre
        return res.render('vista', {productos, username})
    }
    
});

app.get('/login', async (req, res) =>{
    return res.render('login')
})

app.post('/login', async (req, res) =>{
    const {username} = req.body
    req.session.nombre = username
    res.redirect('/')
})

app.get('/logout', async (req, res) => {
    
    const username = req.session.nombre
    req.session.destroy(err=>{
        if(err){
            res.json({err})
        } else {
            res.render('logout', {username})
        }
    }) 
    
    
});

app.get('/api/productos-test', (req, res) => {
    const CANT_PROD = 5
    let objs = []

    for (let index = 0; index <= 5; index++){
        objs.push(generarObjetoRandom())
    }
    return res.render('testProductos', {objs})
})
// app.post('/productos', async (req, res) =>{
//     // DB_PRODUCTOS.insertar(await req.body)
    
//     res.redirect('/')
// })





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