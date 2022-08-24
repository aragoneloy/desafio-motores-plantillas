// ---------------------------- Módulos ----------------------------
const express = require('express');
const Contenedor = require('./Contenedor.js')
const path = require('path')


// ---------------------------- instancias del servidor ----------------------------
const app = express();

//DB
const contenedor = new Contenedor('./DB/productos.json')


// ---------------------------- Middlewares ----------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

//motor de plantillas
app.set('views', './views');
app.set('view engine', 'ejs');


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
app.get('/', (req, res) => {
    res.send('Hello World!');
});


const server = app.listen(PORT, () =>  {
    console.log('servidor corriendo en el puerto 8080');
    
} );
