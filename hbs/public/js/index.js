
const socket = io();
 
socket.on('from-server-mensajes', mensajes => {
    render(mensajes);
});

function render(mensajes){
    
    const cuerpoMensajesHTML = mensajes.map((msj)=>{
        const date = new Date();
        const [month, day, year] = [date.getMonth(), date.getDate(), date.getFullYear()];
        const [hour, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()];

        return `<span><b>${msj.author}[${day}/${month}/${year} ${hour}:${minutes}:${seconds}]: </b><span>${msj.text}</span></span>`
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

// socket.on('from-server-productos', productos =>{
//     render(productos)
// })

// function render(productos) {
//     const cuerpoProductosHTML = productos.map((prod)=>{
//         return `<tr>
//         <td>${prod.title}</td>
//         <td>${prod.price}</td>
//         <td>
//             <img width="30" src="${prod.thumbnail}" alt="">
//         </td>
//     </tr>`
//     })
//     document.querySelector('#listadoProductos').innerHTML = cuerpoProductosHTML
// }

// function agregarProducto() {
//     const inputTitle = document.querySelector('#title')
//     const inputPrice = document.querySelector('#price')
//     const inputThumbnail = document.querySelector('#thumbnail');

//     const producto = {
//         title: inputTitle.value,
//         price: inputPrice.value,
//         thumbnail: inputThumbnail.value
//     }

//     socket.emit('from-client-producto', producto)
// }
