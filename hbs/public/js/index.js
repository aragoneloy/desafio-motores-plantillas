
const socket = io();


// DESNORMALIZACION
const authorSchema = new normalizr.schema.Entity('author', {}, {idAttribute: 'email'})

const mensajeSchema = new normalizr.schema.Entity('post', { author: authorSchema}, {idAttribute: 'id'})

const mensajesSchema = new normalizr.schema.Entity('posts', { mensajes: [mensajeSchema] }, {idAttribute: 'id'})

socket.on('from-server-mensajes', mensajesNorm => {
    let mensajesNormSize = JSON.stringify(mensajesNorm).length
    console.log(mensajesNorm, mensajesNormSize)

    let mensajesDesnorm = normalizr.denormalize(mensajesNorm.result, mensajesSchema, mensajesNorm.entities)

    let mensajesDesnormSize = JSON.stringify(mensajesDesnorm).length
    console.log(mensajesDesnorm, mensajesDesnormSize)

    let porcentajeCompresion = parseInt((mensajesNormSize * 100 / mensajesDesnormSize))
    console.log(`Porcentaje de compresion ${porcentajeCompresion}%`)

    document.querySelector('#porcentajeCompresion').innerText = `Porcentaje de compresion ${porcentajeCompresion}%`
    
    renderMensajes(mensajesDesnorm);
});

function renderMensajes(mensajesDesnorm){
    console.log('mensajesdesnor', mensajesDesnorm)
    const cuerpoMensajesHTML = mensajesDesnorm.mensajesDB.map((msj)=>{
        return `<span><b>${msj.author.id} ${msj.timestamp}: </b><span>${msj.text} <img width='50' src="${msj.author.avatar}" alt=""></span></span>`
    }).join('<br>') 

    
document.querySelector('#historial').innerHTML = cuerpoMensajesHTML
    
    
}

function enviarMensaje() {
    
    
    
    const inputId = document.querySelector('#id')
    const inputNombre = document.querySelector('#nombre')
    const inputApellido = document.querySelector('#apellido')
    const inputEdad = document.querySelector('#edad')
    const inputAlias = document.querySelector('#alias')
    const inputAvatar = document.querySelector('#avatar')
    const inputContenido = document.querySelector('#contenidoMensaje')
    

    const mensaje = {
        author: {
            id: inputId.value,
            nombre: inputNombre.value,
            apellido: inputApellido.value,
            edad: inputEdad.value,
            alias: inputAlias.value,
            avatar: inputAvatar.value,
        },
        text: inputContenido.value,
        
    }
    
    socket.emit('from-client-mensaje', mensaje)
}




//---------------PRODUCTOS

socket.on('from-server-productos', productos =>{
    renderProductos(productos)
})

function renderProductos(productos) {
    const cuerpoProductosHTML = productos.map((prod)=>{
                return `<tr>
                <td>${prod.title}</td>
                <td>${prod.price}</td>
                <td>
                    <img width="30" src="${prod.thumbnail}" alt="">
                </td>
            </tr>`
    })
    
    console.log(cuerpoProductosHTML)
    document.querySelector('#listadoProductos').innerHTML = cuerpoProductosHTML
    // document.querySelector('#listadoProductos').insertAdjacentHTML("beforeend", cuerpoProductosHTML[cuerpoProductosHTML.length - 1])
}

function agregarProducto() {
    

    const inputTitle = document.querySelector('#title')
    const inputPrice = document.querySelector('#price')
    const inputThumbnail = document.querySelector('#thumbnail');

    const producto = {
        title: inputTitle.value,
        price: inputPrice.value,
        thumbnail: inputThumbnail.value
    }

    socket.emit('from-client-producto', producto)
}

