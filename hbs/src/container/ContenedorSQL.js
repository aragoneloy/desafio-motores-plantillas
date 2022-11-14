import knex from 'knex';
import config from '../utils/config.js';
import {logger} from '../utils/logger.config.js'



export default class ContenedorSQL {
    constructor(tableName, config){
        this.knexCli = knex(config);
        this.tableName = tableName;
    }

    async listarAll(){
        try {
            return await this.knexCli.from(this.tableName).select('*')
        } catch (error) {
            logger.error(`Error en api productos: ${error} `);
            throw error; 
        }
        
    }

    async listar(id){
        try {
            return await this.knexCli.from(this.tableName).select('*').where({id: id})
        } catch (error) {
            logger.error(`Error en api mensajes: ${error} `);
            throw error; 
        }
    }

    async insertar(obj){
        try {
            return await this.knexCli(this.tableName).insert(obj)
        } catch (error) {
            logger.error(`Error en api mensajes: ${error} `);
           throw error; 
        }
        
    }

    async actualizar(id, obj){
        try {
            return await this.knexCli.from(this.tableName).where({id: id}).update(obj)
        } catch (error) {
            logger.error(`Error en api mensajes: ${error} `);
            throw error
        }
    }

    async eliminar(id){
        try {
            return await this.knexCli.from(this.tableName).where({id: id}).del();
        } catch (error) {
            logger.error(`Error en api mensajes: ${error} `);
            throw error;
        }

    }

    cerrarConexion() {
        this.knexCli.destroy();
    }

}

