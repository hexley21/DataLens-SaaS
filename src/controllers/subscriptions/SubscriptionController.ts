import createHttpError from "http-errors";
import IController from "../../common/interfaces/IController";
import AppDataSource from "../../data/AppDataSource";
import TiersEnum from "../../models/entities/enum/TiersEnum";
import RecordEntity from "../../models/entities/subscription/RecordEntity";
import TierEntity from "../../models/entities/subscription/TierEntity";
import CompanyEntity from "../../models/entities/users/CompanyEntity";
import CompanyController from "../users/CompanyController";
import EmployeeEntity from "../../models/entities/users/EmployeeEntity";
import UserEntity from "../../models/entities/users/UserEntity";


class SubscriptionController extends IController<RecordEntity> {

    constructor() {
        super(AppDataSource.getRepository(RecordEntity), "sr")
    }

    public async startNewSubscription(user_id: string, user_count: number, tier: TiersEnum) {
        const subscription = await this.findSubscriptionByCompanyUserId(user_id)

        const transaction = AppDataSource.createQueryRunner()
        await transaction.startTransaction()

        try {
            const newSubscription = ((await transaction.manager.createQueryBuilder(RecordEntity, "sr")
                .insert()
                .values({ company_id: subscription.company_id, user_count: user_count, tier_id: tier })
                .returning("*")
                .execute()).raw as RecordEntity[])[0]

            await transaction.manager.createQueryBuilder()
                .update(CompanyEntity)
                .set({ subscription_id: newSubscription.id })
                .where("id = :id", { id: newSubscription.company_id })
                .execute()

            await transaction.commitTransaction();
        }
        catch (e) {
            await transaction.rollbackTransaction();
            throw e;
        }
        finally {
            await transaction.release();
        }

    }



    public async changeTier(user_id: string, tier: TiersEnum) {
        const subscription = await this.findSubscriptionByCompanyUserId(user_id)
        
        if (subscription.tier_id === tier) throw createHttpError(409, "You can't re-subscribe ro your tier")

        const upgradeQuery = this.createQueryBuilder("sr")
            .update()

        const tierUpdateParams: { tier_id: TiersEnum, tier_start?: Date} = { tier_id: tier}
        if (subscription.tier_id === TiersEnum.FREE) tierUpdateParams.tier_start = new Date()

        return await upgradeQuery.set(tierUpdateParams).where("id = :subscription_id", { subscription_id: subscription.id}).execute()
    }


    public async findSubscriptionByCompanyUserIdFormatted(company_user_id: string) {

        return (await this.createTypedQueryBuilder<CompanyEntity>(CompanyEntity, "c")
            .leftJoin(RecordEntity, "sr", "c.subscription_id = sr.id")
            .leftJoin(TierEntity, "t", "t.id = sr.tier_id")
            .select("sr.user_count, sr.files_uploaded, sr.tier_start, sr.tier_end, t.name as tier")
            .addSelect(`(t.price::numeric + 
            CASE 
              WHEN t.user_price IS NOT NULL THEN sr.user_count * (t.user_price::numeric) 
              ELSE 0 
            END +
            CASE 
              WHEN sr.files_uploaded > t.file_limit THEN (sr.files_uploaded - t.file_limit) * (t.file_price::numeric) 
              ELSE 0
            END)::money`, "current_bill")
            .where("c.user_id =:user_id", { user_id: company_user_id})
            .getRawOne()) as {
                user_count: number,
                files_uploaded: number,
                tier_start: Date,
                tier_end: Date,
                tier: string,
                current_bill: string
            }
    }

    public async findSubscriptionByCompanyUserId(company_user_id: string): Promise<RecordEntity> {
        return (await this.createTypedQueryBuilder<CompanyEntity>(CompanyEntity, "c")
            .leftJoin(RecordEntity, "sr", "c.subscription_id = sr.id")
            .select("sr.*")
            .where("c.user_id =:user_id", { user_id: company_user_id})
            .getRawOne()) as RecordEntity
    }


    public async findSubscriptionIndependent(user_id: string): Promise<RecordEntity> {
        return ((await this.createTypedQueryBuilder<UserEntity>(UserEntity, "u")
            .select("sr.*")
            .leftJoin(CompanyEntity, "c", "c.user_id = u.id")
            .leftJoin(EmployeeEntity, "e", "e.user_id = u.id")
            .leftJoin(CompanyEntity, "c2", "c2.id = COALESCE(c.id, e.company_id)")
            .leftJoin(RecordEntity, "sr", "sr.id = c2.subscription_id")
            .where("u.id = :user_id", { user_id: user_id })
            .getRawOne()) as RecordEntity)
    }

}

export default new SubscriptionController()