import { Request, Response, NextFunction } from "express";
import SubscriptionController from "../controllers/subscriptions/SubscriptionController";
import createHttpError from "http-errors";

export async function incrementFileCount(req: Request, res: Response, next: NextFunction) {
    if (!req.file) return next(createHttpError(400, "File was not found"))

    await SubscriptionController.changeFileCount(res.locals.user_id, 1)
    next()
}
