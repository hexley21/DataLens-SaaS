import { Request, Response } from "express";
import Router from "express-promise-router";

import UserController from "../../controllers/UserController.js";
import BasicEmailService from "../../services/BasicEmailService.js";

import createHttpError from "http-errors";


export default Router()
.post("/:email", async (req: Request, res: Response) => {
    const user = await UserController.findByEmail(req.params.email as string)

    if (user == null) throw createHttpError(404, "This user does not exist")

    if(!user.registration_date) {
        BasicEmailService.sendConfirmation(user.id, user.email);
        res.send("Confirmation email was resent")
    } else {
        res.send("This user is already active")
    }
})