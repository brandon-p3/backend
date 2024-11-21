"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatControllers_1 = require("../controllers/chatControllers"); // Asegúrate de que la ruta sea correcta
class ChatRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        // Ruta para enviar un mensaje al chatbot
        this.router.post('/send-message', chatControllers_1.chatControllers.sendMessage);
    }
}
const chatRoutes = new ChatRoutes();
exports.default = chatRoutes.router;
