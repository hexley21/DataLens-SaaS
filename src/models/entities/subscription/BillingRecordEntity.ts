import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

import PlanEntity from "./PlanEntity.js";

import CompanyEntity from "../users/CompanyEntity.js";
import TiersEnum from "../../../common/enum/TiersEnum.js";


@Entity({
    schema: "subscription",
    name: "billing_record"
})
export default class BillingRecordEntity {
    
    constructor(company_id: string, plan_id: TiersEnum, plan_start?: Date, user_count?: number, files_uploaded?: number) {
        this.company_id = company_id;
        this.plan_id = plan_id;
        
        if (plan_start) this.plan_start = plan_start;
        if (user_count) this.user_count = user_count;
        if (files_uploaded) this.files_uploaded = files_uploaded;
    }

    
    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @Column({
        type: "varchar",
        name: "company_id",
        nullable: false
    })
    public company_id!: string;

    @Column({
        type: "integer",
        name: "plan_id",
        nullable: false
    })
    public plan_id!: number;

    @Column({
        type: "date",
        name: "plan_start",
        nullable: false
    })
    public plan_start!: Date;

    @Column({
        type: "date",
        name: "plan_end",
        generatedType: "STORED",
        asExpression: `plan_start + INTERVAL '1 month'`,
        nullable: false
    })
    public plan_end!: Date;

    @Column({
        type: "date",
        name: "billed_at",
        nullable: true
    })
    public billed_at?: Date;

    @Column({
        type: "integer",
        name: "user_count",
        nullable: false
    })
    public user_count!: number;

    @Column({
        type: "integer",
        name: "files_uploaded",
        nullable: false
    })
    public files_uploaded!: number;


    @ManyToOne(() => PlanEntity, (plan) => plan.billing_records)
    @JoinColumn({ name: "plan_id" })
    public plan?: PlanEntity;

    @ManyToOne(() => CompanyEntity, (company) => company.billing_records)
    @JoinColumn({ name: "company_id" })
    public company?: Relation<CompanyEntity>;

}