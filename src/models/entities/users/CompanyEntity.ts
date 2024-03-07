import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

import IndustriesEntity from "../IndustriesEntity.js";

import EmployeeEntity from "./EmployeeEntity.js";

import BillingRecordEntity from "../subscription/BillingRecordEntity.js";

import IndustriesEnum from "../../../common/base/enum/IndustriesEnum.js";
import CountriesEnum from "../../../common/base/enum/CountriesEnum.js";


@Entity({
    schema: "users",
    name: "company"
})
export default class CompanyEntity {

    constructor(user_id: string, company_name: string, industry: IndustriesEnum, country: CountriesEnum, is_active?: boolean, current_billing_id?: string) {
        this.user_id = user_id;
        this.company_name = company_name;
        this.industry = industry;
        this.country = country;
        
        if (is_active) this.is_active = is_active;
        if (current_billing_id) this.current_billing_id = current_billing_id;
    }


    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @Column({
        type: "uuid",
        name: "user_id",
        nullable: false
    })
    public user_id!: string;


    @Column({
        type: "uuid",
        name: "current_billing_id",
        nullable: true
    })
    public current_billing_id?: string;

    @Column({
        type: "varchar",
        name: "company_name",
        nullable: false
    })
    public company_name!: string;

    @Column({
        type: "varchar",
        name: "industry",
        nullable: false
    })
    public industry!: IndustriesEnum;

    @Column({
        type: "varchar",
        name: "country",
        nullable: true
    })
    public country?: CountriesEnum;    

    @Column({
        type: "boolean",
        name: "is_active",
        nullable: false
    })
    public is_active!: boolean;

    @OneToOne(() => IndustriesEntity)
    @JoinColumn({
        name: "industry",
        referencedColumnName: "id"
    })
    public industry_obj?: string;


    @OneToMany(() => EmployeeEntity, (employee) => employee.company)
    public employees?: EmployeeEntity[];

    @OneToMany(() => BillingRecordEntity, (billing_record) => billing_record.company)
    public billing_records?: BillingRecordEntity[];

}
