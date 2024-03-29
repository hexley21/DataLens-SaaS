import { Request, Response } from "express";
import Router from "express-promise-router";

import RegisterController from "../../controllers/RegisterController.js";
import { isActiveByEmail } from "../../middlewares/active.js";


export default Router()
.post("/:email", isActiveByEmail(false),  async (req: Request, res: Response) => {
        await RegisterController.sendActivation(req.params.email);
        res.send("Confirmation email was resent");
})
