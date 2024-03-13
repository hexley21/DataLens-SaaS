import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";
import RoleEnum from "../../models/entities/enum/RoleEnum.js";
import isRole from "../../middlewares/role.js";

import SubscriptionController from "../../controllers/subscriptions/SubscriptionController.js";
import TiersEnum from "../../models/entities/enum/TiersEnum.js";
import createHttpError from "http-errors";


export default Router()
.get("/", authentication, isRole(RoleEnum.COMPANY), async (req: Request, res: Response) => {
    res.send(await SubscriptionController.getSubscriptionByUser(res.locals.user_id))
})
.patch("/:tier", authentication, isRole(RoleEnum.COMPANY), async (req: Request, res: Response) => {
    if (!Object.values(TiersEnum).includes(req.params.tier)) throw createHttpError(400, "Invalid tier, see tier list on /api/list/tiers")

    await SubscriptionController.changeTier(res.locals.user_id, TiersEnum[req.params.tier as keyof typeof TiersEnum])

    res.send(`Subscription changed to: ${req.params.tier}`);
})
