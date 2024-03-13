import IController from "../../common/interfaces/IController";
import AppDataSource from "../../data/AppDataSource";
import RecordEntity from "../../models/entities/subscription/RecordEntity";
import CompanyEntity from "../../models/entities/users/CompanyEntity";
import EmployeeEntity from "../../models/entities/users/EmployeeEntity";

class SubscriptionController extends IController<RecordEntity> {

    constructor() {
        super(AppDataSource.getRepository(RecordEntity), "sr")
    }


    public async getSubscriptionIdIndependent(user_id: string): Promise<string> {
        const companyQuery = this.createTypedQueryBuilder(CompanyEntity, "c")
            .select("c.subscription_id", "subscription_id")
            .where(`c.user_id = '${user_id}'`)
            .getQuery()


        const employeeQuery = this.createTypedQueryBuilder(CompanyEntity, "c")
            .select("c.subscription_id", "subscription_d")
            .innerJoin(EmployeeEntity, "e", "c.id = e.company_id")
            .where(`e.user_id = '${user_id}'`)
            .getQuery()

        const res = (await AppDataSource.query(`${companyQuery} UNION  ${employeeQuery}`))[0] as { subscription_id: string }

        return res.subscription_id
    }
    

    public async changeFileCount(user_id: string, value: number) {
        const operation = value < 0 ? "" : "+"

        await this.createQueryBuilder()
            .update()
            .set({ 
                files_uploaded: () => `files_uploaded ${operation}${value}`
            })
            .where("id = :id", { id: await this.getSubscriptionIdIndependent(user_id) })
            .execute();
    }

    public async changeUserCount(user_id: string, value: number) {
        const operation = value < 0 ? "" : "+"

        await this.createQueryBuilder()
            .update()
            .set({ 
                user_count: () => `user_count ${operation}${value}`
            })
            .where("id = :id", { id: await this.getSubscriptionIdIndependent(user_id) })
            .execute();
    }

}

export default new SubscriptionController()