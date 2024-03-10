import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import IndustriesEntity from "../IndustriesEntity.js";
import EmployeeEntity from "./EmployeeEntity.js";
import RecordEntity from "../subscription/RecordEntity.js";

import CountriesEntity from "../CountriesEntity.js";
import UserEntity from "./UserEntity.js";


@Entity({
    schema: "users",
    name: "company"
})
export default class CompanyEntity {

    static newInstance(user_id: string, company_name?: string, industry?: string, country?: string, subscription_id?: string): CompanyEntity {
        const company = new CompanyEntity();

        company.user_id = user_id;
        company.company_name = company_name!;

        company.country = country!;
        company.industry = industry!;
        
        company.subscription_id = subscription_id;

        return company;
    }


    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @Column({ type: "uuid", name: "user_id", nullable: false })
    public user_id!: string;


    @Column({ type: "uuid", name: "subscription_id", nullable: true })
    public subscription_id?: string;

    @Column({ type: "varchar", name: "company_name", nullable: false })
    public company_name!: string;

    @Column({ type: "varchar", name: "industry", nullable: false })
    public industry!: string;

    @Column({ type: "varchar", name: "country", nullable: false })
    public country!: string;

    @ManyToOne(() => IndustriesEntity)
    @JoinColumn({
        name: "industry",
        referencedColumnName: "id"
    })
    public industry_obj?: string;

    @ManyToOne(() => CountriesEntity)
    @JoinColumn({
        name: "country",
        referencedColumnName: "id"
    })
    public country_obj?: string;

    @OneToOne(() => UserEntity)
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id"
    })
    public user?: UserEntity

    @OneToMany(() => EmployeeEntity, (employee) => employee.company)
    public employees?: EmployeeEntity[];

    @OneToMany(() => RecordEntity, (record) => record.company)
    public records?: RecordEntity[];

}
