import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";
import isRole from "../../middlewares/role.js";
import RoleEnum from "../../models/entities/enum/RoleEnum.js";
import { hasToPay } from "../../middlewares/billing.js";
import SubscriptionController from "../../controllers/subscriptions/SubscriptionController.js";
import createHttpError from "http-errors";
import TiersEnum from "../../models/entities/enum/TiersEnum.js";


export default Router()
.get("/", authentication, isRole(RoleEnum.COMPANY), hasToPay(false), async (req: Request, res: Response) => {
    res.send(await SubscriptionController.findSubscriptionByCompanyUserIdFormatted(res.locals.user_id))
})
.post("/:amount", authentication, isRole(RoleEnum.COMPANY), hasToPay(false), async (req: Request, res: Response) => {
    const amount = parseFloat(req.params.amount as string)

    if (isNaN(amount)) throw createHttpError(400, "Invalid amount, please enter integer or floating number corresponding to bill.")

    const subscription = await SubscriptionController.findSubscriptionByCompanyUserIdFormatted(res.locals.user_id)
    const hasToPay = parseFloat(subscription.current_bill.replace("$", ""))

    if (amount > Math.ceil(hasToPay)) throw createHttpError(400, "Thank you, but you overpaid, we don't need a tip 😊")
    if (amount < hasToPay) throw createHttpError(400, "Your card was declined...")

    await SubscriptionController.startNewSubscription(res.locals.user_id, subscription.user_count, TiersEnum[subscription.tier as keyof typeof TiersEnum])
    res.redirect("/api/subscription")
})