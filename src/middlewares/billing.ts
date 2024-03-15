import { Request, Response, NextFunction } from "express";

import createHttpError from "http-errors";
import SubscriptionController from "../controllers/subscriptions/SubscriptionController.js";
import TiersEnum from "../models/entities/enum/TiersEnum.js";


export function hasToPay(condition: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const subscription = await SubscriptionController.findSubscriptionIndependent(res.locals.user_id)

        if (subscription.tier_end <= new Date() && condition) {
            if (subscription.tier_id === TiersEnum.FREE) {
                await SubscriptionController.startNewSubscription(res.locals.user_id, subscription.user_count, TiersEnum.FREE)
                return next()
            }

            return next(createHttpError(403, "Your subscription has ended, pay the bill at /api/billing"))
        }

        if (subscription.tier_end > new Date() && !condition) {
            return next(createHttpError(409, "Subscription has not ended yet"))
        }

        return next()
    }
}
