export function randomizar(cant) {
  const arrRandom = []
  let objRandom = []
  
  for (let i = 1; i <= cant; i++){
      arrRandom.push(getRandomIntInclusive())
  } 


  let count = 1;
  arrRandom.sort(function(a,b){
  return a-b})

  let singleElements = []
  let repeatedElements = []

    for(let i = 0; i <= arrRandom.length; i++){
    if(arrRandom[i + 1] === arrRandom[i]){
      count++;
    } else {
      singleElements.push(arrRandom[i])
      repeatedElements.push(count)
      count = 1;
    }
  }

  for(let i = 0; i <= singleElements.length; i++){
    // console.log(singleElements[i])
    let elem = singleElements[i]
    let repElem = repeatedElements[i]
    
    let newObj = {nroRandom: elem, vecesRepetido: repElem}
    
    objRandom.push(newObj)
    
  }

  return objRandom;
}

process.on('message', cant => {
  console.log('mensaje desde el procesos principal:\n');
  console.log(cant);

  const objetoRandom = randomizar(cant)
  // console.log(objetoRandom)
  process.send(objetoRandom)
});


function getRandomIntInclusive() {
    let min = Math.ceil(1);
    let max = Math.floor(1000);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

