import express from 'express'
import { fork } from 'child_process';


// ---------------------------- Child process ----------------------------
const forkProcess = fork('./random.js')

const routerRandoms = express.Router();

routerRandoms.get('/', async (req, res) => {
    let {cant} = req.query
    if (cant == undefined){
        cant = 100000000
    }
    console.log('cant random', cant)
    forkProcess.send(cant);
    
    forkProcess.on('message', msg => {
        
        console.log('mensaje desde el proceso secundario:');
        console.log(msg)
        
    });
    res.send('esperando proceso secundario...')
    
    
});


export default routerRandoms