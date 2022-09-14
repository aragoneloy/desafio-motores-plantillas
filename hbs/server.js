// ---------------------------- Módulos ----------------------------
import express from 'express'
import exphbs from 'express-handlebars'
import path from 'path'
import { createServer } from "http";
import { Server } from "socket.io";
import  ContenedorSQL  from './src/container/ContenedorSQL.js'
import {config}  from './src/utils/config.js'
import {configSQ3} from './src/utils/configSQ3.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// ---------------------------- instancias del servidor ----------------------------
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });


//DB
// const contenedor = new Contenedor('./DB/productos.json')

const DB_MENSAJES = new ContenedorSQL('mensajes', configSQ3)

const DB_PRODUCTOS = new ContenedorSQL('productos', config)

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
    const productos = await DB_PRODUCTOS.listarAll()
    
    return res.render('vista', {productos})
});

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
    const mensajes = await DB_MENSAJES.listarAll()
    
    io.emit('from-server-mensajes', mensajes)

    socket.on('from-client-mensaje', async mensaje => {
        
        DB_MENSAJES.insertar(await mensaje);

        
        io.emit('from-server-mensajes', mensajes);
    })

    const productos = await DB_PRODUCTOS.listarAll()
    
    io.emit('from-server-productos', productos)

    socket.on('from-client-producto', async producto =>{
        
        DB_PRODUCTOS.insertar(await producto);
        
        io.emit('from-server-productos', productos)
    })
})
