import knex from 'knex';
import config from '../utils/config.js';



export default class ContenedorSQL {
    constructor(tableName, config){
        this.knexCli = knex(config);
        this.tableName = tableName;
    }

    async listarAll(){
        try {
            return await this.knexCli.from(this.tableName).select('*')
        } catch (error) {
            throw error; 
        }
        
    }

    async listar(id){
        try {
            return await this.knexCli.from(this.tableName).select('*').where({id: id})
        } catch (error) {
            throw error; 
        }
    }

    async insertar(obj){
        try {
            return await this.knexCli(this.tableName).insert(obj)
        } catch (error) {
           throw error; 
        }
        
    }

    async actualizar(id, obj){
        try {
            return await this.knexCli.from(this.tableName).where({id: id}).update(obj)
        } catch (error) {
            throw error
        }
    }

    async eliminar(id){
        try {
            return await this.knexCli.from(this.tableName).where({id: id}).del();
        } catch (error) {
            throw error;
        }

    }

    cerrarConexion() {
        this.knexCli.destroy();
    }

}

