const socket = io();
 
socket.on('from-server-mensajes', mensajes => {
    render(mensajes);
});

function render(mensajes){
    const cuerpoMensajesHTML = mensajes.map((msj)=>{
        return `<span><b>${msj.author}: </b><span>${msj.text}</span></span>`
    }).join('<br>') 

    
document.querySelector('#historial').innerHTML = cuerpoMensajesHTML
    
    
}

function enviarMensaje() {
    const inputUser = document.querySelector('#user')
    const inputContenido = document.querySelector('#contenidoMensaje')

    const mensaje = {
        author: inputUser.value,
        text: inputContenido.value
    }

    socket.emit('from-client-mensaje', mensaje)
}

socket.on('from-server-productos', productos =>{
    render(productos)
})

function render(productos) {
    const cuerpoProductosHTML = productos.map((prod)=>{
        return `<tr>
        <td>${prod.title}</td>
        <td>${prod.price}</td>
        <td>
            <img width="30" src="${prod.thumbnail}" alt="">
        </td>
    </tr>`
    })
    document.querySelector('#listadoProductos').innerHTML = cuerpoProductosHTML
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
