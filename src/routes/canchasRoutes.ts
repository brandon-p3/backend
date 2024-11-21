import { Router } from "express";
import { canchasControllers } from "../controllers/canchasControllers";

class CanchaRoutes {
    public router: Router = Router();

    constructor() {
        this.config();
    }

    config(): void {
        // Ruta para obtener todas las canchas
        this.router.get('/', canchasControllers.index);
        // Ruta para obtener una cancha por ID
        this.router.get('/:idCancha', canchasControllers.getCancha);
        // Ruta para crear una nueva cancha
        this.router.post('/', canchasControllers.create);
        // Ruta para eliminar una cancha por ID
        this.router.delete('/:idCancha', canchasControllers.delete);
        // Ruta para actualizar una cancha por ID
        this.router.put('/:idCancha', canchasControllers.updateCancha);
        //selecionar tres cnachas cercanas
        this.router.get('/nearby/:lat/:lon', canchasControllers.getThreeCanchas);
    }
}

const canchaRoutes = new CanchaRoutes();
export default canchaRoutes.router;
