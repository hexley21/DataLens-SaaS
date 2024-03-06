import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import UserEntity from "./UserEntity.js";
import CompanyEntity from "./CompanyEntity.js";


@Entity({
    schema: "users",
    name: "employee"
})
export default class EmployeeEntity {

    constructor(user_id: string, company_id: string) {
        this.user_id = user_id;
        this.company_id = company_id;
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
        name: "company_id",
        nullable: false
    })
    public company_id!: string;


    @OneToOne(() => UserEntity)
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id"
    })
    public user?: UserEntity

    @ManyToOne(() => CompanyEntity, (company) => company.employees)
    public company?: CompanyEntity;

}
