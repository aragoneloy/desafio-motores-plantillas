import express from 'express'
import { fork } from 'child_process';
import PORT from '../../server.js';
import process from 'process';
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
    res.send(`Ruta especial en ${PORT} - PID ${process.pid} - ${new Date().toLocaleString()}`)
    
    
});


export default routerRandoms