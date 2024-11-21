"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const canchasControllers_1 = require("../controllers/canchasControllers");
class CanchaRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        // Ruta para obtener todas las canchas
        this.router.get('/', canchasControllers_1.canchasControllers.index);
        // Ruta para obtener una cancha por ID
        this.router.get('/:idCancha', canchasControllers_1.canchasControllers.getCancha);
        // Ruta para crear una nueva cancha
        this.router.post('/', canchasControllers_1.canchasControllers.create);
        // Ruta para eliminar una cancha por ID
        this.router.delete('/:idCancha', canchasControllers_1.canchasControllers.delete);
        // Ruta para actualizar una cancha por ID
        this.router.put('/:idCancha', canchasControllers_1.canchasControllers.updateCancha);
        //selecionar tres cnachas cercanas
        this.router.get('/nearby/:lat/:lon', canchasControllers_1.canchasControllers.getThreeCanchas);
    }
}
const canchaRoutes = new CanchaRoutes();
exports.default = canchaRoutes.router;
