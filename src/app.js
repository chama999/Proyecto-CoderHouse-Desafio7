//Declaración de variables
const path=require('path')
const filesDir=path.normalize(__dirname + "/files/")
const productFile='product.json'
const shoppingCartFile='shopping-cart.json'
const express = require("express")
const libsDir=path.normalize(__dirname + "/libs/lib.js")
const Lib = require(libsDir)
const { Router } = express;
const productRouter = Router();
const shoppingCartRouter = Router();
const multer = require('multer')
const urlLista = "http://localhost/" + process.env.PORT||3000 + "/list"
let visitCounter = 0
let requestCounter = 0
const app = express();
const lib = new Lib()
const privilege = "admin"

//middlewares
app.use(express.static(__dirname +"/public"));
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use('/files', express.static('uploads'))

//configuración storage del multer.
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})
//multer para subir archivos
const upload = multer({ storage })

// SET TEMPLATE ENGINE
app.set('views', 'public')
app.set('view engine', 'ejs')


//imprimo fecha hora en cada visita y genero contador.
app.use(function(req, res, next) {
    console.log("Dir: " + filesDir + "File: " + productFile)
    console.log("Dir: " + filesDir + "File: " + shoppingCartFile)
    lib.createFile(productFile, filesDir)
    lib.createFile(shoppingCartFile, filesDir)
    console.log("Time: ", Date.now())
    visitCounter++
    next()
    })

//por cada request, creo arc-hivo y guardo contador.
productRouter.use(function (req, res, next) {
    try {
        if (lib.validatePrivilege(privilege)) {
            lib.createFile(productFile, filesDir)
            requestCounter++
            next()
        } else {
            throw new Error("No tienes permisos para acceder a " + req.originalUrl + ". Método: " + req.method)
        }
    } catch (error) {
        res.status(401).send({
            error: {
            status: -1,
            message: error.message,
            stack: error.stack
            }   
        })
    }
})


shoppingCartRouter.use(function (req, res, next) {
    try {
        if (lib.validatePrivilege(privilege)) {
            lib.createFile(shoppingCartFile, filesDir)
            requestCounter++
            next()
        } else {
            throw new Error("No tienes permisos para acceder a " + req.originalUrl + ". Método: " + req.method)
        }
    } catch (error) {
        res.status(401).send({
            error: {
            status: -1,
            message: error.message
            }   
        })
    }
})

app.get('/', (req, res) => {
    let listaProductos = lib.getAllObjects(productFile, filesDir)
    let listaCarrito=lib.getAllObjects(shoppingCartFile, filesDir)
    res.render('index',{list: listaProductos,visitCounter,requestCounter,urlLista})
})

productRouter.get('/', (req, res) => {
    try {
        console.log("GET todos los productos")
        let productos = lib.getAllObjects(productFile, filesDir)
        res.json(productos)
        }
    catch (error) {  
        res.status(404).send({
            error: {
            status: 404,
            message: error.message
            }
        })  
    }
})

productRouter.get('/:id', (req, res) => {
    try {
        console.log("GET por ID")
        let productos = lib.getAllObjects(productFile, filesDir)
        let id = req.params.id;
        console.log("Id a buscar: "+ id)
        let producto = productos.find(c => c.id == id)
        if (producto == undefined) {
            throw new Error(`Producto ${id} no encontrado`)

        } else {
            console.log(`El producto con ${id} es: ${producto}`)
            res.json(producto)
        }
    } catch (error) {  
        res.status(404).send({
            error: {
            status: 404,
            message: error.message
            }
        })  
    }
})

productRouter.post("/", upload.single('thumbail'), (req, res) => {
    console.log("Inicio Guardado de Producto: "+ JSON.stringify(req.body));
    let obj = req.body
    const file = req.file
    console.log("Nombre Archivo: "+ JSON.stringify(file))
    obj.thumbail = "/files/" + file.filename;
    console.log("Producto guardado: " + obj.thumbail)
    console.log("Objeto: " + JSON.stringify(obj))
    console.log("productFile: " + productFile)
    console.log("filesDir: " + filesDir)


    lib.saveObjects(obj, productFile, filesDir)
    console.log("Producto guardado: " + JSON.stringify(obj))

    return res.redirect("/")
})

productRouter.put('/:id', (req, res) => {
    try{
        console.log("------new put request-------")
        let productos = lib.getAllObjects(productFile, filesDir)
        let id = req.params.id;
        console.log("-------------------------")
        console.log("Id a buscar: "+ id)
        let productIndex = productos.findIndex(c => c.id == id)
        console.log("-------------------------")
        console.log("Index a buscar: "+ productIndex)
        if (productIndex<0) {
            throw new Error(`No se encontro el producto con ${id}`) 
        }
        else {
            console.log(`El producto con id ${id} es: ${JSON.stringify(productos[productIndex])}`)
            console.log("-------------------------")
            console.log("-------------------------")
            console.log(productos[productIndex].thumbail)
            console.log("-------------------------")
            console.log("-------------------------")
            lib.updateObjectById(req.body, id, productos[productIndex].thumbail, productFile, filesDir)
            console.log("-------------------------")
            console.log(JSON.stringify(productos[productIndex]))
            res.json({
                resultCode: '200',
                message: 'Producto actualizado',
                nuevo: req.body
            })
        }
    } catch (error) {
        res.status(404).send({
            error: {
            status: 404,
            message: error.message
            }
        })
    }
    })




productRouter.delete('/:id', (req, res) => {
    try {
        //delete from object listaProductos
        let listaProductos = lib.getAllObjects(productFile, filesDir)
        let id = req.params.id;
        console.log("Id a borrar: "+ id)
        let producto = listaProductos.find(c => c.id == id)
        if (producto == undefined) {
            res.status(400).send(
                {
                    error: "400",
                    errorMessage: `Producto id: ${id} no encontrado`
                }
            )
        }
        else {
            console.log(`El producto con ${id} es: ${producto}`)
            lib.deleteObjectById(id,productFile, filesDir)
            res.send({
                resultCode: '200',
                title: producto.title,
                id: producto.id,
                message: 'Producto borrado'
            })
    }
    } catch (error) {
        res.status(404).send({
            error: {
            status: 404,
            message: error.message
            }
})
    }
})

//*********************************//
//*************ROUTER**************//
//*************CARRITO*************//
//*********************************//
shoppingCartRouter.get('/', (req, res) => {
    try {
        console.log("Carrito GET por ID")
        let carritos = lib.getAllObjects(shoppingCartFile, filesDir)
        if (carritos.length==0){
                throw new Error(`El Carrito está vacío`)
        } else {
                res.json(carritos)
        }
        } catch (error) {  
        res.status(404).send({
            error: {
            status: 404,
            message: error.message
            }
        })  
    }
})

shoppingCartRouter.get('/:id/productos', (req, res) => {
    try {
        console.log("Carrito GET por ID")
        let carritos = lib.getAllObjects(shoppingCartFile, filesDir)
        let id = req.params.id;
        console.log("Id del carrito a buscar: "+ id)
        let carrito = carritos.find(c => c.id == id)
        if (carrito == undefined) {
            throw new Error(`Carrito ${id} no encontrado`)

        } else {
            console.log(`El carrito con ${id} es: ${carrito}`)
            res.json(carrito)
        }
    } catch (error) {  
        res.status(404).send({
            error: {
            status: 404,
            message: error.message
            }
        })  
    }
})

shoppingCartRouter.post("/", (req, res) => {
    console.log("Inicio Guardado de Carrito: "+ JSON.stringify(req.body));
    let obj = req.body
    const file = req.file
    console.log("Nombre Archivo: "+ file)
    obj.thumbail = "/files/" + file.filename;
    console.log("Carrito guardado" + obj.thumbail)

    lib.saveObjects(obj, shoppingCartFile, filesDir)
    console.log("Carrito guardado" + JSON.stringify(obj))

    return res.redirect("/")
})



shoppingCartRouter.delete('/:id', (req, res) => {
    try {
        //delete from object listaProductos
        let listaCarrito = lib.getAllObjects(shoppingCartFile, filesDir)
        let id = req.params.id;
        console.log("Id Carrito a borrar: "+ id)
        let carrito = listaCarrito.find(c => c.id == id)
        if (carrito == undefined) {
            res.status(400).send(
                {
                    error: "400",
                    errorMessage: `Carrito id: ${id} no encontrado`
                }
            )
        }
        else {
            console.log(`El Carrito con ${id} es: ${carrito}`)
            lib.deleteObjectById(id,shoppingCartFile, filesDir)
            res.send({
                resultCode: '200',
                title: carrito.title,
                id: carrito.id,
                message: 'Producto borrado'
            })
    }
    } catch (error) {
        res.status(404).send({
            error: {
            status: 404,
            message: error.message
            }
})
    }
})


app.use('/api/productos', productRouter)
app.use('/api/carrito', shoppingCartRouter)

const server = app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port 3000")
})

app.use(function(err, req, res, next) {
    //res.status(400).send("Pagina no disponible en este momento. Por favor, intente más tarde.")
    res.status(err.status || 404).send({
        err: {
        status: err.status || 404,
        message: err.message || "Pagina no encontrada.",
        stack: err.stack
        }
    })  
})