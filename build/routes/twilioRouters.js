"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const twilioControllers_1 = require("../controllers/twilioControllers");
class TwilioRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post('/start-verification', twilioControllers_1.twilioControllers.startVerification);
        this.router.post('/check-verification', twilioControllers_1.twilioControllers.checkVerification);
    }
}
const twilioRoutes = new TwilioRoutes();
exports.default = twilioRoutes.router;
