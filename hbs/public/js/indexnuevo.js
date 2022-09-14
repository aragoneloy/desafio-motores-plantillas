
// const socket = io();


// Render y almacenado productos

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
async function agregarProducto() {
    

  const inputTitle = document.querySelector('#title')
  const inputPrice = document.querySelector('#price')
  const inputThumbnail = document.querySelector('#thumbnail');

  const producto = {
      title: inputTitle.value,
      price: inputPrice.value,
      thumbnail: inputThumbnail.value
  }
  
  let res;
  res = await apiProductos.insertar(producto)
  
  socket.emit('from-client-producto', producto)
}

async function main() {
    

    let res;
    // res = await apiProductos.insertar(listaProductos)
    // console.log('inserta en tabla', res)

    // res = await apiProductos.listarAll();
    // console.log(res)

    res = await apiProductos.listar(2);
    console.log(res)

    await apiProductos.cerrarConexion();
}
main();