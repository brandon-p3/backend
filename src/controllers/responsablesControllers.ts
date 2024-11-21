import { Request, Response } from "express";
import pool from "../database";
import nodemailer from "nodemailer";
import crypto from "crypto"; // Para generar un token único
class ResponsablesControllers {
    public async index(req: Request, resp: Response) {
        const responsables = await pool.query(
            "SELECT * FROM responsable INNER JOIN rol ON rol.idRoles = responsable.idRoles"
        );
        resp.json(responsables);
    }

    public async getResponsable(req: Request, res: Response): Promise<void> {
        const { idResp } = req.params;
        try {
            const result = await pool.query(
                "SELECT * FROM responsable WHERE idResp = ?",
                [idResp]
            );
            if (result.length > 0) {
                res.json(result[0]);
            } else {
                res.status(404).json({ message: "Responsable no encontrado" });
            }
        } catch (error) {
            res
                .status(500)
                .json({ message: "Error al obtener el responsable", error });
        } 
    }

    public async create(req: Request, resp: Response): Promise<void> {
        console.log(req.body);
        try {
            await pool.query("INSERT INTO responsable SET ?", [req.body]);
            resp.json({ message: "Responsable guardado" });
        } catch (error: any) {
            // Utiliza 'any' para manejar el error genérico
            if (
                error.code === "ER_SIGNAL_EXCEPTION" &&
                typeof error.sqlMessage === "string"
            ) {
                const messages = error.sqlMessage.split(". ");
                resp.status(400).json({
                    message: messages.filter((msg: string) => msg !== "").join(". "),
                });
            } else {
                resp
                    .status(500)
                    .json({ message: "Error al guardar el responsable", error });
            }
        }
    }

    public async delete(req: Request, resp: Response) {
        const { idResp } = req.params;
        await pool.query("DELETE FROM responsable WHERE idResp = ?", [idResp]);
        resp.json({ message: "Responsable eliminado" });
    }

    public async updateResponsable(req: Request, res: Response): Promise<void> {
        const { idResp } = req.params;
        const updateData = req.body;
        try {
            const result = await pool.query(
                "UPDATE responsable SET ? WHERE idResp = ?",
                [updateData, idResp]
            );
            if (result.affectedRows > 0) {
                res.json({ message: "Responsable actualizado" });
            } else {
                res
                    .status(404)
                    .json({ message: "Responsable no encontrado para actualizar" });
            }
        } catch (error) {
            res
                .status(500)
                .json({ message: "Error al actualizar el responsable", error });
        }
    }
    // Método para obtener ID por nombre de usuario

    public async getIdByUsername(req: Request, res: Response): Promise<void> {
        const { nombUsuario } = req.params;
        try {
            const result = await pool.query(
                "SELECT idResp FROM responsable WHERE nombUsuario = ?",
                [nombUsuario]
            );
            if (result.length > 0) {
                res.json(result[0]);
            } else {
                res
                    .status(404)
                    .json({ message: "Responsable no encontrado desde getId" });
            }
        } catch (error) {
            res
                .status(500)
                .json({ message: "Error al obtener el responsable", error });
        }
    }

    // Método para validar usuario
    public async validateUser(req: Request, res: Response): Promise<void> {
        const { nombUsuario, contrasenia } = req.body;
        try {
            const result = await pool.query(
                "SELECT idResp, idRoles FROM responsable WHERE nombUsuario = ? AND contrasenia = ?",
                [nombUsuario, contrasenia]
            );
            if (Array.isArray(result) && result.length > 0) {
                res.json(result[0]);
            } else {
                res.status(404).send("Usuario o contraseña incorrectos");
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error en la consulta validateUser");
        }
    }

    public async buscarResponsable(req: Request, res: Response): Promise<void> {
        const { correoElec, telefono } = req.body;
        try {
            const result = await pool.query(
                "SELECT idResp FROM responsable WHERE correoElec = ? OR telefono = ?",
                [correoElec, telefono]
            );
            if (result.length > 0) {
                res.json(result[0]);
            } else {
                res
                    .status(404)
                    .json({ message: "Responsable no encontrado para actualizar " });
            }
        } catch (error) {
            res
                .status(500)
                .json({ message: "Error al buscar el responsable", error });
        }
    }

    public async updateContrasenia(req: Request, res: Response): Promise<void> {
        const { idResp } = req.params;
        const { contrasenia } = req.body;
        try {
            const result = await pool.query(
                "UPDATE responsable SET contrasenia = ? WHERE idResp = ?",
                [contrasenia, idResp]
            );
            if (result.affectedRows > 0) {
                res.json({ message: "Contraseña actualizada" });
            } else {
                res.status(404).json({
                    message: "Responsable no encontrado para actualizar la contraseña",
                });
            }
        } catch (error) {
            res
                .status(500)
                .json({ message: "Error al actualizar la contraseña", error });
        }
    }

    // Método para obtener ID por nombre de usuario y con detalles del pago
    public async enviarCorreoAscenso(req: Request, res: Response): Promise<void> {
        const { razon, payerInfo } = req.body; // Incluye payerInfo en el cuerpo
    
        if (!razon) {
            res.status(400).json({ message: 'La razón del ascenso es requerida' });
            return;
        }
    
        try {
            const userId = req.body.userId; // Asegúrate de que el userId se envíe desde el frontend
            const responsable = await pool.query('SELECT nombres, appPaterno, appMaterno, correoElec, telefono, numControl FROM responsable WHERE idResp = ?', [userId]);
    
            if (responsable.length === 0) {
                res.status(404).json({ message: 'Responsable no encontrado' });
                return;
            }
    
            const { nombres, appPaterno, appMaterno, correoElec, telefono, numControl } = responsable[0];
    
            // Actualizar el valor de idRoles a 1 (administrador)
            await pool.query('UPDATE responsable SET idRoles = 1 WHERE idResp = ?', [userId]);
    
            // Configurar el transporte de correo
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'control.actividades.2024@gmail.com',
                    pass: 'nxzw oini eywx rbum'
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
    
            const mailOptions = {
                from: 'control.actividades.2024@gmail.com',
                to: correoElec,
                subject: '🦅 Comprobante de ascenso 🦅',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
                        <h2 style="color: #2E86C1; border-bottom: 2px solid #2E86C1; padding-bottom: 10px;">Saludos, ${nombres} ${appPaterno} ${appMaterno}</h2>
                        <p>Por medio del presente, quisiera presentar un comprobante por su ascenso en la aplicación "Control de Actividades del Gimnasio Auditorio de la UTNG" con razón de:</p>
                        <blockquote style="font-style: italic; color: #555; border-left: 3px solid #2E86C1; padding-left: 10px; margin: 20px 0;">"${razon}"</blockquote>
                        <p>Anexo sus datos de identificación:</p>
                        <ul style="list-style-type: none; padding: 0; margin: 0;">
                            <li style="padding: 5px 0;"><strong>Nombre Completo:</strong> ${nombres} ${appPaterno} ${appMaterno}</li>
                            <li style="padding: 5px 0;"><strong>Correo Electrónico:</strong> ${correoElec}</li>
                            <li style="padding: 5px 0;"><strong>Teléfono:</strong> ${telefono}</li>
                            <li style="padding: 5px 0;"><strong>Número de Control:</strong> ${numControl}</li>
                        </ul>
                        <p style="margin-top: 20px;"><strong>Información del Pago:</strong></p>
                        <ul style="list-style-type: none; padding: 0; margin: 0;">
                            <li style="padding: 5px 0;"><strong>Nombre del Pagador:</strong> ${payerInfo.nombre} ${payerInfo.apellido}</li>
                            <li style="padding: 5px 0;"><strong>Correo del Pagador:</strong> ${payerInfo.correo}</li>
                            <li style="padding: 5px 0;"><strong>ID de Transacción:</strong> ${payerInfo.idTransaccion}</li>
                            <li style="padding: 5px 0;"><strong>Monto:</strong> ${payerInfo.monto} ${payerInfo.moneda}</li>
                            <li style="padding: 5px 0;"><strong>Estado:</strong> ${payerInfo.estado}</li>
                            <li style="padding: 5px 0;"><strong>Fecha de Pago:</strong> ${new Date(payerInfo.fecha).toLocaleString()}</li>
                            <li style="padding: 5px 0;"><strong>Método de Pago:</strong> ${payerInfo.metodoPago}</li>
                            <li style="padding: 5px 0;"><strong>Descripción:</strong> ${payerInfo.descripcion}</li>
                        </ul>
                        <p style="margin-top: 20px;">Agradezco su atención y quedamos a disposición para cualquier información adicional que se requiera.</p>
                        <p style="margin-top: 20px;">Atentamente,</p>
                        <p style="font-weight: bold; margin: 0;">Equipo de Recursos Humanos</p>
                        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="font-size: 0.9em; color: #888;">Este es un correo generado automáticamente, por favor no responda a este mensaje.</p>
                    </div>
                `
            };
    
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Correo enviado exitosamente' });
    
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            res.status(500).json({ message: 'Error al enviar el correo', error });
        }
    }
    

    //verificar correos

    public async enviarCorreoVerificacion(
        req: Request,
        res: Response
    ): Promise<void> {
        const { correoElec } = req.body;

        if (!correoElec) {
            res.status(400).json({ message: "Correo electrónico es requerido" });
            return;
        }

        try {
            const result = await pool.query(
                "SELECT idResp, nombres, nombUsuario FROM responsable WHERE correoElec = ?",
                [correoElec]
            );

            if (result.length === 0) {
                res.status(404).json({ message: "Usuario no encontrado" });
                return;
            }

            const { idResp, nombres, nombUsuario } = result[0];
            const token = crypto.randomBytes(20).toString("hex");

            // Guardar el token en la base de datos con una expiración (opcional)
            await pool.query(
                "UPDATE responsable SET tokenVerificacion = ?, tokenExpiracion = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE idResp = ?",
                [token, idResp]
            );

            // Configurar el transporte de correo
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "control.actividades.2024@gmail.com",
                    pass: "nxzw oini eywx rbum",
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });

            const mailOptions = {
                from: "control.actividades.2024@gmail.com",
                to: correoElec,
                subject: "Verificación de Correo Electrónico",
                text: `
            Hola ${nombres},

            Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:

            https://poetic-sawine-b8ac9a.netlify.app//verificar-correo/${token} 
            Recuerda que tu nombre de usuario es: ${nombUsuario}
            Si no solicitaste esta verificación, por favor ignora este correo.
            
            Atentamente,
            Control de Actividades
            `,
            }; //cambiar url en producción

            await transporter.sendMail(mailOptions);
            res
                .status(200)
                .json({ message: "Correo de verificación enviado exitosamente" });
        } catch (error) {
            console.error("Error al enviar el correo de verificación:", error);
            res
                .status(500)
                .json({ message: "Error al enviar el correo de verificación", error });
        }
    }

    public async verificarToken(req: Request, res: Response): Promise<void> {
        const { token } = req.params;

        try {
            const result = await pool.query(
                "SELECT idResp FROM responsable WHERE tokenVerificacion = ? AND tokenExpiracion > NOW()",
                [token]
            );
            if (result.length === 0) {
                res.status(400).json({ message: "Token inválido o expirado" });
                return;
            }

            const { idResp } = result[0];
            res.status(200).json({
                message:
                    "Token verificado, puedes proceder con la recuperación de contraseña",
                idResp,
            });
        } catch (error) {
            console.error("Error al verificar el token:", error);
            res.status(500).json({ message: "Error al verificar el token", error });
        }
    }

    //Método para actualzar la ubicación del usuario
    public async updateUserLocation(req: Request, res: Response): Promise<void> {
        const { idResp } = req.params;
        const { lat, lng } = req.body;

        try {
            const result = await pool.query(
                "UPDATE responsable SET latitud = ?, longitud = ? WHERE idResp = ?",
                [lat, lng, idResp]
            );
            if (result.affectedRows > 0) {
                res.json({ message: "Localización actualizada del responsable" });
            } else {
                res.status(404).json({ message: "Responsable no encontrado" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar la ubicación" });
        }
    }

    //Metodo para el telefono
    public async updateTelefono(req: Request, res: Response): Promise<void> {
        const { idResp } = req.params;
        const { telefono } = req.body;
    
        if (!telefono) {
            res.status(400).json({ message: "El número de teléfono es requerido" });
            return;
        }
    
        try {
            const result = await pool.query(
                "UPDATE responsable SET telefono = ? WHERE idResp = ?",
                [telefono, idResp]
            );
            if (result.affectedRows > 0) {
                res.json({ message: "Número de teléfono actualizado" });
            } else {
                res.status(404).json({
                    message: "Responsable no encontrado para actualizar el teléfono",
                });
            }
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar el teléfono", error });
        }
    }
    
}

export const responsablesControllers = new ResponsablesControllers();
