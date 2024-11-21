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
exports.chatControllers = void 0;
const dialogflow_1 = require("@google-cloud/dialogflow");
const path_1 = __importDefault(require("path"));
const sessionClient = new dialogflow_1.SessionsClient({
    keyFilename: path_1.default.join(__dirname, '../control-actividades-c1881-a67f5600a8ce.json') // Ajusta la ruta
});
exports.chatControllers = {
    sendMessage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const sessionId = req.body.sessionId; // ID de la sesión
        const query = req.body.query; // Mensaje del usuario
        const sessionPath = sessionClient.projectAgentSessionPath('control-actividades-c1881', sessionId);
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: query,
                    languageCode: 'es',
                },
            },
        };
        try {
            const responses = yield sessionClient.detectIntent(request);
            const result = (_a = responses[0].queryResult) === null || _a === void 0 ? void 0 : _a.fulfillmentText; // Respuesta de Dialogflow
            res.json({ response: result });
        }
        catch (error) {
            const e = error; // Aserción de tipo
            console.error('Error al detectar la intención:', e.message); // Imprimir el mensaje de error
            res.status(500).send(`Error al procesar la solicitud: ${e.message}`); // Enviar el mensaje de error en la respuesta
        }
    })
};
