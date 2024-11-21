import { Request, Response } from "express";
import Twilio from 'twilio';

const ACCOUNT_SID = 'AC17cb8ec9f42d271457d052fee2a93345'; 
const AUTH_TOKEN = 'e53f61a0a12e334e9e85dbe8cfb91bf4';
const SERVICE_SID = 'VA992e48a146045f0f6e2d00e3922bc546';

const client = Twilio(ACCOUNT_SID, AUTH_TOKEN);

class TwilioControllers {
    public async startVerification(req: Request, res: Response): Promise<void> {
        const { phoneNumber } = req.body;

        try {
            const verification = await client.verify.services(SERVICE_SID)
                .verifications
                .create({ to: phoneNumber, channel: 'sms' });
            res.status(200).json(verification);
        } catch (error) {
            console.error('Error starting verification:', error);
            res.status(500).json({ message: 'Error starting verification', error });
        }
    }

    public async checkVerification(req: Request, res: Response): Promise<void> {
        const { phoneNumber, code } = req.body;

        try {
            const verificationCheck = await client.verify.services(SERVICE_SID)
                .verificationChecks
                .create({ to: phoneNumber, code });
            res.status(200).json(verificationCheck);
        } catch (error) {
            console.error('Error checking verification:', error);
            res.status(500).json({ message: 'Error checking verification', error });
        }
    }
}

export const twilioControllers = new TwilioControllers();
