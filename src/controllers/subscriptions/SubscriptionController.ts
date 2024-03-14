import createHttpError from "http-errors";
import IController from "../../common/interfaces/IController";
import AppDataSource from "../../data/AppDataSource";
import TiersEnum from "../../models/entities/enum/TiersEnum";
import RecordEntity from "../../models/entities/subscription/RecordEntity";
import TierEntity from "../../models/entities/subscription/TierEntity";
import CompanyEntity from "../../models/entities/users/CompanyEntity";
import EmployeeEntity from "../../models/entities/users/EmployeeEntity";

class SubscriptionController extends IController<RecordEntity> {

    constructor() {
        super(AppDataSource.getRepository(RecordEntity), "sr")
    }


    public async changeTier(user_id: string, tier: TiersEnum) {
        const subscription_id = await this.getSubscriptionIdIndependent(user_id)
         
        const subscription = await this.getSubscriptionById(subscription_id)

        if (subscription.tier_id === tier) throw createHttpError(409, "You can't re-subscribe ro your tier")

        const upgradeQuery = this.createQueryBuilder("sr")
            .update()

        const tierUpdateParams: { tier_id: TiersEnum, tier_start?: Date} = { tier_id: tier}


        if (subscription.tier_id === TiersEnum.FREE) tierUpdateParams.tier_start = new Date()

        return await upgradeQuery.set(tierUpdateParams).where("id = :subscription_id", { subscription_id: subscription_id}).execute()
    }

    public async getSubscriptionIdIndependent(user_id: string): Promise<string> {
        const companyQuery = this.createTypedQueryBuilder(CompanyEntity, "c")
            .select("c.subscription_id", "subscription_id")
            .where(`c.user_id = '${user_id}'`)
            .getQuery()


        const employeeQuery = this.createTypedQueryBuilder(CompanyEntity, "c")
            .select("c.subscription_id", "subscription_id")
            .innerJoin(EmployeeEntity, "e", "c.id = e.company_id")
            .where(`e.user_id = '${user_id}'`)
            .getQuery()

        const res = (await AppDataSource.query(`${companyQuery} UNION  ${employeeQuery}`))[0] as { subscription_id: string }

        return res.subscription_id
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