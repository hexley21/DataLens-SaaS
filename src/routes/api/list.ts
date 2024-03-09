import { Request, Response } from "express";
import Router from "express-promise-router";

import { EntityTarget, ObjectLiteral } from "typeorm";

import AppDataSource from "../../data/AppDataSource.js";

import IndustriesEntity from "../../models/entities/IndustriesEntity.js";
import CountriesEntity from "../../models/entities/CountriesEntity.js";
import TierEntity from "../../models/entities/subscription/TierEntity.js";


export default Router()
.get("/", (req: Request, res: Response) => {
    res.send("Industry and Country list is available")
})
.get("/industries", async (req: Request, res: Response) => {
    res.send(await listAnything(IndustriesEntity));
})
.get("/countries", async (req: Request, res: Response) => {
    res.send(await listAnything(CountriesEntity));
})
.get("/tiers", async (req: Request, res: Response) => {
    res.send(await listAnything(TierEntity))
})


async function listAnything<R extends ObjectLiteral>(entity: EntityTarget<R>): Promise<R[]> {
    return await AppDataSource.getRepository(entity).find();
}