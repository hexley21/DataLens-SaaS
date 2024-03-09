import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import IndustriesEntity from "../IndustriesEntity.js";
import EmployeeEntity from "./EmployeeEntity.js";
import RecordEntity from "../subscription/RecordEntity.js";

import IndustriesEnum from "../enum/IndustriesEnum.js";
import CountriesEnum from "../enum/CountriesEnum.js";


@Entity({
    schema: "users",
    name: "company"
})
export default class CompanyEntity {

    constructor(user_id: string, company_name: string, industry: IndustriesEnum, country: CountriesEnum, subscription_id?: string) {
        this.user_id = user_id;
        this.company_name = company_name;
        this.industry = industry;
        this.country = country;
        
        if (subscription_id) this.subscription_id = subscription_id;
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
        name: "subscription_id",
        nullable: true
    })
    public subscription_id?: string;

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

    @OneToOne(() => IndustriesEntity)
    @JoinColumn({
        name: "industry",
        referencedColumnName: "id"
    })
    public industry_obj?: string;


    @OneToMany(() => EmployeeEntity, (employee) => employee.company)
    public employees?: EmployeeEntity[];

    @OneToMany(() => RecordEntity, (record) => record.company)
    public records?: RecordEntity[];

}
