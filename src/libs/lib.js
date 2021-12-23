const fs = require('fs')


class Lib {
    constructor(title, thumbail, price) {
        this.title = title;
        this.thumbail = thumbail;
        this.price = price;
    }
    
    validatePrivilege(privilege) {
        if (privilege == "admin") {
            return true;
        } else {
            return false;
        }
    }
    //clear json file
    clearFile(archivo, dir) {
        fs.writeFileSync(dir+archivo, '[]')
    }

    //create file if not exist
    createFile(archivo, dir) {
        console.log("Creando Archivo")
        if (!fs.existsSync(dir)) {
            console.log(`Carpeta Archivos no existe ${dir}, procedemos a crearla`);
            fs.mkdirSync(dir)
            return true;
        }
        if (!fs.existsSync(dir+archivo)) {
            console.log(`Archivo productos.json no existe en ${dir}${archivo}, procedemos a crearlo`);
            fs.writeFileSync(dir+archivo, '[]')
            return true;
        }
        if (fs.existsSync(dir+archivo)){
            console.log(`Archivo existente ${dir}${archivo}, procedemos a limpiar`);
            //this.clearFile()
            return true;
        }
    }


    //return last id number object from json file
    getLastId(archivo, dir) {
        let lastId = 0;
        let data = fs.readFileSync(dir+archivo, 'utf8');
        data = JSON.parse(data);
        data.forEach(element => {
            if (element.id > lastId) {
                lastId = element.id;
            }
        });
        return lastId;
    }

    // save objects in json file.
    saveObjects(objects, archivo, dir) {
        console.log("finalDir: "+ dir + archivo)
        console.log("----SavingObject-----")
        console.log(JSON.stringify(objects))
        console.log("--------------------")
        let data = fs.readFileSync(dir + archivo, 'utf8');
        let finalObject = {
            ...objects,
            id: this.getLastId(archivo, dir) + 1,
            timestamp: new Date()
        }
        console.log("----- ID:"+finalObject.id+"-----")
        data = JSON.parse(data);
        data.push(finalObject);
        data = JSON.stringify(data);
        fs.writeFileSync(dir + archivo, data);
    }

    // save objects in json file.
    updateObjectById(objects, id, image, archivo, dir) {
        console.log("----Update object by ID-----")
        console.log(JSON.stringify(objects))
        console.log("--------------------")
        let data = fs.readFileSync(dir+archivo, 'utf8');
        let finalObject = {
            ...objects,
            id: Number(id),
            timestamp: new Date(),
            thumbail: image
        }
        console.log("----- ID:"+finalObject.id+"-----")
        data = JSON.parse(data);
        data = data.map(element => {
            if (element.id == id) {
                return finalObject
            }
            return element
        })
        data = JSON.stringify(data);
        fs.writeFileSync(dir+archivo, data);
    }

    //get objects by id from json file
    getObjectById(id, archivo, dir) {
        let data = fs.readFileSync(dir+archivo, 'utf8');
        data = JSON.parse(data);
        let obj = data.find(element => element.id == id);
        return obj;
    }


    //get all objects from json file
    getAllObjects(archivo, dir) {
        let data = fs.readFileSync(dir+archivo, 'utf8');
        data = JSON.parse(data);
        console.log("-----getting all data -----"+data)
        return data;
    }

    // delete by id number from json file
    deleteObjectById(id, archivo, dir) {
        let data = fs.readFileSync(dir+archivo, 'utf8');
        data = JSON.parse(data);
        data = data.filter(element => element.id != id);
        data = JSON.stringify(data);
        fs.writeFileSync(dir+archivo, data);
    }


    //delete all objects from json file
    deleteAllObjects(archivo, dir) {
        let data = fs.readFileSync(dir+archivo, 'utf8');
        data = JSON.parse(data);
        data = [];
        data = JSON.stringify(data);
        fs.writeFileSync(dir+archivo, data);
    }
}

    //get objects by id from json file
    async function getObjectByIdAsyncAwait(id, archivo, dir) {
        try {
            let data = await fs.readFile(dir+archivo, 'utf8', (error, data) => {
            data = JSON.parse(data);
            let obj = data.find(element => element.id == id);
            console.log("--------------------------")
            console.log(obj);
            console.log("------------------------")
            return obj;
            });
        } catch (error) {
            console.log(error);
        }
    }


module.exports = Lib;
exports.getObjectByIdAsyncAwait = getObjectByIdAsyncAwait;