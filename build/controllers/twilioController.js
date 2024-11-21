"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canchasControllers = void 0;
const database_1 = __importDefault(require("../database"));
class TwilioControllers {
    // Obtener todas las canchas
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const canchas = yield database_1.default.query("SELECT C.*, R.nombUsuario FROM cancha as C INNER JOIN responsable as R ON C.idResp = R.idResp");
                res.json(canchas);
            }
            catch (error) {
                res.status(500).json({ message: "Error al obtener las canchas", error });
            }
        });
    }
    // Obtener una cancha por ID
    getCancha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { idCancha } = req.params;
            try {
                const result = yield database_1.default.query("SELECT C.*, R.nombUsuario FROM cancha as C INNER JOIN responsable as R ON C.idResp = R.idResp WHERE idCancha = ?", [idCancha]);
                if (result.length > 0) {
                    res.json(result[0]);
                }
                else {
                    res
                        .status(404)
                        .json({ message: "Cancha no encontrada desde el metodo getCancha" });
                }
            }
            catch (error) {
                res.status(500).json({ message: "Error al obtener la cancha", error });
            }
        });
    }
    // Crear una nueva cancha
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.default.query("INSERT INTO cancha SET ?", [req.body]);
                res.json({ message: "Cancha guardada" });
            }
            catch (error) {
                if (error.code === "ER_SIGNAL_EXCEPTION" &&
                    typeof error.sqlMessage === "string") {
                    const messages = error.sqlMessage.split(". ");
                    res.status(400).json({
                        message: messages.filter((msg) => msg !== "").join(". "),
                    });
                }
                else {
                    res.status(500).json({ message: "Error al guardar la cancha", error });
                }
            }
        });
    }
    // Actualizar una cancha por ID
    updateCancha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { idCancha } = req.params;
            const updateData = req.body;
            try {
                const result = yield database_1.default.query("UPDATE cancha SET ? WHERE idCancha = ?", [updateData, idCancha]);
                if (result.affectedRows > 0) {
                    res.json({ message: "Cancha actualizada" });
                }
                else {
                    res
                        .status(404)
                        .json({ message: "Cancha no encontrada para actualizar" });
                }
            }
            catch (error) {
                res.status(500).json({ message: "Error al actualizar la cancha", error });
            }
        });
    }
    // Eliminar una cancha por ID
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { idCancha } = req.params;
            try {
                yield database_1.default.query("DELETE FROM cancha WHERE idCancha = ?", [idCancha]);
                res.json({ message: "Cancha eliminada" });
            }
            catch (error) {
                res.status(500).json({ message: "Error al eliminar la cancha", error });
            }
        });
    }
    //selecionar tres cnachas cercanas
    getThreeCanchas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { lat, lon } = req.params;
            if (!lat || !lon) {
                res
                    .status(400)
                    .json({ message: "Faltan parámetros de latitud y longitud" });
                return;
            }
            const latNum = parseFloat(lat);
            const lonNum = parseFloat(lon);
            const radiusMeters = 2.5; // 500 metros en kilómetros (0.1 km)
            try {
                const canchas = yield database_1.default.query(`
            SELECT C.*, R.nombUsuario,
            (
                6371 * acos(
                    cos(radians(?)) * cos(radians(C.latitud)) * cos(radians(C.longitud) - radians(?)) +
                    sin(radians(?)) * sin(radians(C.latitud))
                )
            ) AS distance
            FROM cancha as C
            INNER JOIN responsable as R ON C.idResp = R.idResp
            HAVING distance < ?
            ORDER BY distance
            LIMIT 3
        `, [latNum, lonNum, latNum, radiusMeters] // Usar 0.1 km como el radio
                );
                res.json(canchas);
            }
            catch (error) {
                console.error("Error en la consulta:", error); // Para depurar el error
                res
                    .status(500)
                    .json({ message: "Error al obtener las canchas cercanas", error });
            }
        });
    }
}
exports.canchasControllers = new CanchasControllers();
