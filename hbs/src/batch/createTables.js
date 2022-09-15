import knex from 'knex';
import { config } from '../utils/config.js';
import { configSQ3 } from '../utils/configSQ3.js';

// const knexCli = knex(config.db);
const knexCliMsj = knex(configSQ3.db)
// knexCli.schema.dropTableIfExists('autos')
//     .then(()=>{
//         knexCli.schema.createTable('autos', table => {
//             table.increments('id').primary();
//             table.string('marca', 50).notNullable();
//             table.string('modelo', 50).notNullable();
//         })
//             .then(()=> console.log("Tabla creada"))
//             .catch(err=> {
//                 console.log(err); 
//                 throw err;
//             })
//             .finally(()=>{
//                 knexCli.destroy();
//             });
//     });




knexCliMsj.schema.dropTableIfExists('mensajes')
    .then(()=>{
        knexCliMsj.schema.createTable('mensajes', table => {
            table.increments('id').primary()
            table.string('author', 255).notNullable();
            table.string('text', 500).notNullable()
            
            
        }) 
            .then(()=> console.log("Tabla creada"))
            .catch(err=> {
                console.log(err)
                throw err
            })
            .finally(()=>{
                knexCliMsj.destroy();
            })
    })
