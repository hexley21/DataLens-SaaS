import { QueryFailedError } from "typeorm";

import AppDataSource from "../data/AppDataSource.js";

import RecordEntity from "../models/entities/subscription/RecordEntity.js";
import UserEntity from "../models/entities/users/UserEntity.js";
import CompanyEntity from "../models/entities/users/CompanyEntity.js";

import TiersEnum from "../models/entities/enum/TiersEnum.js";
import RoleEnum from "../models/entities/enum/RoleEnum.js";

import UserController from "./UserController.js";
import createHttpError from "http-errors";


export class SubscriptionController {


    public async activateCompany(user_id: string): Promise<void | never> {
        const user = await UserController.findOneBy({id: user_id})

        if (!user) throw new Error("This company does not exist")
        if (user.is_active) {
            throw createHttpError(409, "This user is already activated")
        }

        if (user!.role === RoleEnum.COMPANY) {
            const transaction = AppDataSource.createQueryRunner();
            await transaction.startTransaction("SERIALIZABLE")
            try {
                const company = await transaction.manager.createQueryBuilder(CompanyEntity, "c")
                    .select()
                    .where({ user_id: user_id})
                    .getOne()

                const newSubscription = ((await transaction.manager.createQueryBuilder(RecordEntity, "b")
                    .insert()
                    .values(new RecordEntity(company!.id, TiersEnum.FREE))
                    .returning("*")
                    .execute()).generatedMaps as RecordEntity[])[0]

                await transaction.manager.createQueryBuilder(CompanyEntity, "c")
                    .update()
                    .set({ subscription_id: newSubscription.id })
                    .where({ id: newSubscription.company_id})
                    .execute()

                await transaction.manager.createQueryBuilder(UserEntity, "u")
                    .update()
                    .set({ is_active: true })
                    .where({ id: user_id})
                    .execute()

                await transaction.commitTransaction()
            }
            catch(e) {
                await transaction.rollbackTransaction()
                if (e instanceof QueryFailedError) {
                    throw createHttpError(400, e.message);
                }
                else {
                    throw createHttpError(500, (e as Error).message);
                }
            }
            finally {
                await transaction.release();
            }
            return;
        }
        throw Error("This is not a company account");

    }

}


export default new SubscriptionController();
