const fs = require('fs/promises');

class Contenedor {
    constructor(ruta) {
        this.ruta = ruta;
    }

    async getAll() {
        try {
            const objs = await fs.readFile(this.ruta, 'utf8');
            
            return JSON.parse(objs); 
        
        } catch (error) {
            return [];
        }
    } 
    
    
    async getById(id) {
        
        try {
            const objs = await this.getAll();
            const objId = objs.find(obj => obj.id == id);
            if (objId == undefined) {
                return {error: 'producto no encontrado'};
            } else { 
                return objId;
            }
           
        } catch (error) {
            return 'Error';
        }

        
    }
    async getRandom() {
        
        try {
            const objs = await this.getAll();
            const objRandom = objs.length == 0 ? null : objs[Math.floor(Math.random() * objs.length)];
            
            return objRandom;
           
        } catch (error) {
            return 'Error';
        }

        
    }
    async save(obj) {
        try {
            const objs = await this.getAll();
            let newId;
            if (objs.length == 0) {
                newId = 1
            } else {
                newId = objs[objs.length - 1].id + 1;
            }

            const newObj = { ...obj, id: newId };
            objs.push(newObj);
        
            
            await fs.writeFile(this.ruta, JSON.stringify(objs, null, 2));
            return newObj;
        }
        catch (error) {
            console.log(error);
        }
    }
   
    async deleteById(id) {
        try {
            const objs = await this.getAll();
            const indexObj = objs.findIndex(obj => obj.id == id);
            if(indexObj == -1) {
                return 'elemento no encontrado';
            } else {
                objs.splice(indexObj, 1);
                await fs.writeFile(this.ruta, JSON.stringify(objs, null, 2));
                return 'elemento eliminado';
            }
        } catch (error){
            return 'No se pudo eliminar';
        }        
        
    }
    async updateById(id, title, price, thumbnail) {
        try {
            const objs = await this.getAll();
            const indexObj = objs.findIndex(obj => obj.id == id);
            if(indexObj == -1) {
                return 'elemento no encontrado';
            } else {
                objs[indexObj].title = title;
                objs[indexObj].price = price;
                objs[indexObj].thumbnail = thumbnail;

                await fs.writeFile(this.ruta, JSON.stringify(objs, null, 2));
                return 'elemento actualizado';
            }
        } catch (error){
            return 'No se pudo actualizar';
        }        
        
    }
    async deleteAll() {
        try {
            const objs = await this.getAll();
            objs.splice(0, objs.length);
            await fs.writeFile(this.ruta, JSON.stringify(objs, null, 2));
            return 'elementos eliminados';
        } catch (error) {
            return 'No se pudo eliminar';
        }
        
        
    }
}


module.exports = Contenedor;