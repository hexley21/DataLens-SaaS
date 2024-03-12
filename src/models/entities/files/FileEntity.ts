import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, Relation } from "typeorm";


@Entity({ schema: "files", name: "file" })
export default class FileEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "uuid", name: "owner_company_id", nullable: false })
    owner_company_id!: string;

    @Column({ type: "uuid", name: "owner_user_id", nullable: false })
    owner_user_id!: string;

    @Column({ type: "varchar", name: "name", length: 64, nullable: false })
    name!: string;

}
