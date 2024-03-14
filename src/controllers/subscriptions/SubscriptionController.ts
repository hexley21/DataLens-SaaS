import createHttpError from "http-errors";
import IController from "../../common/interfaces/IController";
import AppDataSource from "../../data/AppDataSource";
import TiersEnum from "../../models/entities/enum/TiersEnum";
import RecordEntity from "../../models/entities/subscription/RecordEntity";
import TierEntity from "../../models/entities/subscription/TierEntity";
import CompanyEntity from "../../models/entities/users/CompanyEntity";
import EmployeeEntity from "../../models/entities/users/EmployeeEntity";
import { CompanyController } from "../users/CompanyController";

class SubscriptionController extends IController<RecordEntity> {

    constructor() {
        super(AppDataSource.getRepository(RecordEntity), "sr")
    }


    public async changeTier(user_id: string, tier: TiersEnum) {
        const subscription = (await this.createTypedQueryBuilder<CompanyEntity>(CompanyEntity, "c")
            .leftJoin(RecordEntity, "sr", "c.subscription_id = sr.id")
            .select("sr.*")
            .where("c.user_id =:user_id", { user_id: user_id})
            .getRawOne()) as RecordEntity

        
        if (subscription.tier_id === tier) throw createHttpError(409, "You can't re-subscribe ro your tier")

        const upgradeQuery = this.createQueryBuilder("sr")
            .update()

        const tierUpdateParams: { tier_id: TiersEnum, tier_start?: Date} = { tier_id: tier}
        if (subscription.tier_id === TiersEnum.FREE) tierUpdateParams.tier_start = new Date()

        return await upgradeQuery.set(tierUpdateParams).where("id = :subscription_id", { subscription_id: subscription.id}).execute()
    }

    public async getSubscriptionByUser(user_id: string) {
        return await this.createTypedQueryBuilder<CompanyEntity>(CompanyEntity, "c")
            .leftJoin(RecordEntity, "sr", "c.subscription_id = sr.id")
            .leftJoin(TierEntity, "t", "t.id = sr.tier_id")
            .select("sr.user_count, sr.files_uploaded, sr.tier_start, sr.tier_end, t.name as tier")
            .addSelect(`t.price::numeric + 
            CASE 
              WHEN t.user_price IS NOT NULL THEN sr.user_count * (t.user_price::numeric) 
              ELSE 0 
            END +
            CASE 
              WHEN sr.files_uploaded > t.file_limit THEN (sr.files_uploaded - t.file_limit) * (t.file_price::numeric) 
              ELSE 0
            END`, "current_bill")
            .where("c.user_id = :user_id", { user_id: user_id })
            .getRawOne()
    }


    public async getSubscriptionById(subscription_id: string): Promise<RecordEntity> {
        return (await this.createQueryBuilder("sr")
            .select()
            .where("id = :subscription_id", { subscription_id: subscription_id })
            .getOne())!
    }

}

export default new SubscriptionController()