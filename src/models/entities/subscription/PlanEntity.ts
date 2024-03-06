import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import BillingRecordEntity from "./BillingRecordEntity.js";


@Entity({
    schema: "subscription",
    name: "plan"
})
export default class PlanEntity {

    constructor(price: number, name: string, file_limit?: number, user_limit?: number, file_price?: number, user_price?: number) {
        this.price = price;
        this.name = name;
        this.file_limit = file_limit;
        this.user_limit = user_limit;
        this.file_price = file_price;
        this.user_price = user_price;
    }


    @PrimaryGeneratedColumn("increment")
    public id!: number

    
    @Column({
        type: "money",
        name: "price",
        nullable: false
    })
    public price!: number;

    @Column({
        type: "varchar",
        name: "name",
        nullable: false
    })
    public name!: string;

    @Column({
        type: "integer",
        name: "file_limit",
        nullable: true
    })
    public file_limit?: number;

    @Column({
        type: "integer",
        name: "user_limit",
        nullable: true
    })
    public user_limit?: number;

    @Column({
        type: "money",
        name: "file_price",
        nullable: true
    })
    public file_price?: number;

    @Column({
        type: "money",
        name: "user_price",
        nullable: true
    })
    public user_price?: number;


    @OneToMany(() => BillingRecordEntity, (billing_record) => billing_record.plan)
    public billing_records?: BillingRecordEntity[]

}