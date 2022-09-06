// ---------------------------- Módulos ----------------------------
const express = require('express');
const exphbs = require('express-handlebars')
const path = require('path')
const Contenedor = require('./Contenedor.js')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io');


// ---------------------------- instancias del servidor ----------------------------
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer)

//DB
const contenedor = new Contenedor('./DB/productos.json')

const DB_MENSAJES = [
]

const DB_PRODUCTOS = [
]

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
app.get('/',  (req, res) => {
    // DB_PRODUCTOS = await contenedor.getAll()
    return res.render('vista')
});

// app.post('/productos', async (req, res) =>{
//     contenedor.save(await req.body)

//     DB_PRODUCTOS = await contenedor.getAll()
    
//     res.redirect('/')
// })





// ---------------------------- Servidor ----------------------------
const PORT = 8080;

const server = httpServer.listen(PORT, () =>  {
    console.log('servidor corriendo en el puerto 8080');
    
} );

// ---------------------------- Websocket ----------------------------


io.on('connection', (socket)=>{
    console.log(`Nuevo cliente conectado! ${socket.id}`);

    io.emit('from-server-mensajes', DB_MENSAJES)

    socket.on('from-client-mensaje', mensaje => {
        DB_MENSAJES.push(mensaje);
        io.emit('from-server-mensajes', DB_MENSAJES);
    })

    io.emit('from-server-productos', DB_PRODUCTOS)

    socket.on('from-client-producto', producto =>{
        DB_PRODUCTOS.push(producto);
        io.emit('from-server-productos', DB_PRODUCTOS)
    })
})
