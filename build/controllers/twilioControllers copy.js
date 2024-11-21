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
exports.twilioControllers = void 0;
const twilio_1 = __importDefault(require("twilio"));
const ACCOUNT_SID = 'AC9899d82bc620f8d76e950489393ad9f4';
const AUTH_TOKEN = 'bbf6107c6378bd02c2f4f4fee22f2914';
const SERVICE_SID = 'VAff91cf733462653749ce4790a12e1030';
const client = (0, twilio_1.default)(ACCOUNT_SID, AUTH_TOKEN);
class TwilioControllers {
    startVerification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { phoneNumber } = req.body;
            try {
                const verification = yield client.verify.services(SERVICE_SID)
                    .verifications
                    .create({ to: phoneNumber, channel: 'sms' });
                res.status(200).json(verification);
            }
            catch (error) {
                console.error('Error starting verification:', error);
                res.status(500).json({ message: 'Error starting verification', error });
            }
        });
    }
    checkVerification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { phoneNumber, code } = req.body;
            try {
                const verificationCheck = yield client.verify.services(SERVICE_SID)
                    .verificationChecks
                    .create({ to: phoneNumber, code });
                res.status(200).json(verificationCheck);
            }
            catch (error) {
                console.error('Error checking verification:', error);
                res.status(500).json({ message: 'Error checking verification', error });
            }
        });
    }
}
exports.twilioControllers = new TwilioControllers();
