
const socket = io();
 
socket.on('from-server-mensajes', mensajes => {
    renderMensajes(mensajes);
});

function renderMensajes(mensajes){
    
    const cuerpoMensajesHTML = mensajes.map((msj)=>{

        return `<span><b>${msj.author}[${msj.time.day}/${msj.time.month}/${msj.time.year} ${msj.time.hour}:${msj.time.minutes}:${msj.time.seconds}]: </b><span>${msj.text}</span></span>`
    }).join('<br>') 

    
document.querySelector('#historial').innerHTML = cuerpoMensajesHTML
    
    
}

function enviarMensaje() {
    
    
    const inputUser = document.querySelector('#user')
    const inputContenido = document.querySelector('#contenidoMensaje')
    const date = new Date();
    const [month, day, year] = [date.getMonth(), date.getDate(), date.getFullYear()];
    const [hour, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()];

    const mensaje = {
        author: inputUser.value,
        text: inputContenido.value,
        time: {month, day, year, hour, minutes, seconds}
    }
    
    socket.emit('from-client-mensaje', mensaje)
}


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
