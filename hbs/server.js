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
    {author: "juan", text: "Hola"},
    {author: "diego", text: "Hola"},
    {author: "juan", text: "Hola"}
]

const DB_PRODUCTOS = [
    {
        "title": "PINCHILA",
        "price": "2932",
        "thumbnail": "https://cdn1.iconfinder.com/data/icons/journalist-4/64/photo-camera-device-capture-image-256.png",
        "id": 4
      }
    
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
app.get('/', async (req, res) => {
    const productos = await contenedor.getAll()
    return res.render('vista', {productos})
});

app.post('/productos', async (req, res) =>{
    contenedor.save(await req.body)
    console.log(contenedor.getAll())
    res.redirect('/')
})





// ---------------------------- Servidor ----------------------------
const PORT = 8080;

const server = httpServer.listen(PORT, () =>  {
    console.log('servidor corriendo en el puerto 8080');
    
} );

// ---------------------------- Websocket ----------------------------


io.on('connection', (socket)=>{
    console.log(`Nuevo cliente conectado! ${socket.id}`);

    io.sockets.emit('from-server-mensajes', DB_MENSAJES)

    socket.on('from-client-mensaje', mensaje => {
        DB_MENSAJES.push(mensaje);
        io.sockets.emit('from-server-mensajes', DB_MENSAJES);
    })

    io.sockets.emit('from-server-productos', DB_PRODUCTOS)

    socket.on('from-client-producto', producto =>{
        DB_PRODUCTOS.push(producto);
        io.sockets.emit('from-server-productos', DB_PRODUCTOS)
    })
})
