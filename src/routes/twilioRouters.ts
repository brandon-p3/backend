import { Router } from "express";
import { twilioControllers } from "../controllers/twilioControllers";

class TwilioRoutes {
    public router: Router = Router();

    constructor() {
        this.config();
    }

    config(): void {
        this.router.post('/start-verification', twilioControllers.startVerification);
        this.router.post('/check-verification', twilioControllers.checkVerification);
    }
}

const twilioRoutes = new TwilioRoutes();
export default twilioRoutes.router;

