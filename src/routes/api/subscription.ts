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
    res.send(await SubscriptionController.findSubscriptionByCompanyUserIdFormatted(res.locals.user_id))
})
.patch("/:tier", authentication, isRole(RoleEnum.COMPANY), async (req: Request, res: Response) => {
    const tierKey = req.params.tier.toUpperCase()
    
    if (!Object.values(TiersEnum).includes(tierKey)) throw createHttpError(400, "Invalid tier, see tier list on /api/list/tiers")

    await SubscriptionController.changeTier(res.locals.user_id, TiersEnum[(tierKey as keyof typeof TiersEnum)])
    res.redirect("/api/subscription")
})
