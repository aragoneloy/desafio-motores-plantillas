import mongoose from 'mongoose';
import config from '../utils/config.js'


//conecto a la base de datos
await mongoose.connect(config.atlas.strConn)
export default class ContenedorMongoDb {
    
    constructor(nameCollection, esquema){
        this.collection = mongoose.model(nameCollection, esquema)
    }

    async getAll(){
        try {
            let docs = await this.collection.find()
            return docs
        } catch (error) {
            throw error; 
        }
        
    }

    async getByEmail(email){
        try {
            
            const docs = await this.collection.find({email: email})
            if(docs.length == null){
                throw new Error('No se encontro el elemento con el email proporcionado.')
            } else {
                return docs[0]
            }
        } catch (error) {
            throw error; 
        }
    }

    async save(obj){
        try {
            let doc = await this.collection.create(obj)
            return doc
        } catch (error) {
           throw error; 
        }
        
    }

    async updateById(id, obj){
        try {
            console.log('objeto pasado', obj)
           await this.collection.replaceOne({'_id': id}, obj)
        } catch (error) {
            throw error
        }
    }

    async deleteById(id){
        try {
            await this.collection.findByIdAndDelete(id)
        } catch (error) {
            throw error;
        }

    }

    cerrarConexion() {
        mongoose.disconnect()
    }

}

