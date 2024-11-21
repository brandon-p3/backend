import { Request, Response } from "express";
import pool from "../database";

class CanchasControllers {
  // Obtener todas las canchas
  public async index(req: Request, res: Response): Promise<void> {
    try {
      const canchas = await pool.query(
        "SELECT C.*, R.nombUsuario FROM cancha as C INNER JOIN responsable as R ON C.idResp = R.idResp"
      );
      res.json(canchas);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las canchas", error });
    }
  }

  // Obtener una cancha por ID
  public async getCancha(req: Request, res: Response): Promise<void> {
    const { idCancha } = req.params;
    try {
      const result = await pool.query(
        "SELECT C.*, R.nombUsuario FROM cancha as C INNER JOIN responsable as R ON C.idResp = R.idResp WHERE idCancha = ?",
        [idCancha]
      );
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res
          .status(404)
          .json({ message: "Cancha no encontrada desde el metodo getCancha" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al obtener la cancha", error });
    }
  }

  // Crear una nueva cancha
  public async create(req: Request, res: Response): Promise<void> {
    try {
      await pool.query("INSERT INTO cancha SET ?", [req.body]);
      res.json({ message: "Cancha guardada" });
    } catch (error: any) {
      if (
        error.code === "ER_SIGNAL_EXCEPTION" &&
        typeof error.sqlMessage === "string"
      ) {
        const messages = error.sqlMessage.split(". ");
        res.status(400).json({
          message: messages.filter((msg: string) => msg !== "").join(". "),
        });
      } else {
        res.status(500).json({ message: "Error al guardar la cancha", error });
      }
    }
  }

  // Actualizar una cancha por ID
  public async updateCancha(req: Request, res: Response): Promise<void> {
    const { idCancha } = req.params;
    const updateData = req.body;
    try {
      const result = await pool.query(
        "UPDATE cancha SET ? WHERE idCancha = ?",
        [updateData, idCancha]
      );
      if (result.affectedRows > 0) {
        res.json({ message: "Cancha actualizada" });
      } else {
        res
          .status(404)
          .json({ message: "Cancha no encontrada para actualizar" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar la cancha", error });
    }
  }

  // Eliminar una cancha por ID
  public async delete(req: Request, res: Response): Promise<void> {
    const { idCancha } = req.params;
    try {
      await pool.query("DELETE FROM cancha WHERE idCancha = ?", [idCancha]);
      res.json({ message: "Cancha eliminada" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar la cancha", error });
    }
  }

  //selecionar tres cnachas cercanas
  public async getThreeCanchas(req: Request, res: Response): Promise<void> {
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
      const canchas = await pool.query(
        `
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
        `,
        [latNum, lonNum, latNum, radiusMeters] // Usar 0.1 km como el radio
      );

      res.json(canchas);
    } catch (error) {
      console.error("Error en la consulta:", error); // Para depurar el error
      res
        .status(500)
        .json({ message: "Error al obtener las canchas cercanas", error });
    }
}

}

export const canchasControllers = new CanchasControllers();
