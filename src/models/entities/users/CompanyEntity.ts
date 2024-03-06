import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import IndustriesEntity from "../IndustriesEntity.js";
import EmployeeEntity from "./EmployeeEntity.js";


@Entity({
    schema: "users",
    name: "company"
})
export default class CompanyEntity {

    constructor(user_id: string, current_billing_id: string, company_name: string, industry: string, country: string, is_active?: boolean) {
        this.user_id = user_id;
        this.current_billing_id = current_billing_id;
        this.company_name = company_name;
        this.industry = this.industry;
        this.country = this.country;
        
        if (is_active) this.is_active = is_active;
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
        nullable: false
    })
    public current_billing_id!: string;

    @Column({
        type: "string",
        name: "company_name",
        nullable: false
    })
    public company_name!: string;

    @Column({
        type: "varchar",
        name: "industry",
        nullable: false
    })
    public industry!: string;

    @Column({
        type: "varchar",
        name: "country",
        nullable: true
    })
    public country?: string;

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
    public industry_obj?: IndustriesEntity;


    @OneToMany(() => EmployeeEntity, (employee) => employee.company)
    public employees?: EmployeeEntity[];

}
