import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

import TierEntity from "./TierEntity.js";

import CompanyEntity from "../users/CompanyEntity.js";
import TiersEnum from "../enum/TiersEnum.js";


@Entity({
    schema: "subscription",
    name: "record"
})
export default class RecordEntity {
    
    constructor(company_id: string, tier_id: TiersEnum, tier_start?: Date, user_count?: number, files_uploaded?: number) {
        this.company_id = company_id;
        this.tier_id = tier_id;
        
        if (tier_start) this.tier_start = tier_start;
        if (user_count) this.user_count = user_count;
        if (files_uploaded) this.files_uploaded = files_uploaded;
    }

    
    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @Column({ type: "varchar", name: "company_id", nullable: false})
    public company_id!: string;

    @Column({ type: "integer", name: "tier_id", nullable: false })
    public tier_id!: number;

    @Column({ type: "date", name: "tier_start", nullable: false })
    public tier_start!: Date;

    @Column({ type: "date", name: "tier_end", generatedType: "STORED", asExpression: `tier_start + INTERVAL '1 month'`,  nullable: false  })
    public tier_end!: Date;

    @Column({ type: "date", name: "billed_at", nullable: true })
    public billed_at?: Date;

    @Column({ type: "integer", name: "user_count", nullable: false })
    public user_count!: number;

    @Column({ type: "integer", name: "files_uploaded", nullable: false })
    public files_uploaded!: number;


    @ManyToOne(() => TierEntity, (tier) => tier.records)
    @JoinColumn({ name: "tier_id" })
    public tier?: TierEntity;

    @ManyToOne(() => CompanyEntity, (company) => company.subscription_id)
    @JoinColumn({ name: "company_id" })
    public company?: Relation<CompanyEntity>;

}