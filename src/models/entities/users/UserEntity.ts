import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from "typeorm";

import RoleEnum from "../enum/RoleEnum.js";


@Entity({
    schema: "users",
    name: "user"
})
export default class UserEntity {

    constructor(email?: string, role?: RoleEnum, hash?: string, salt?: string, registration_date?: Date, ) {
        this.email = email!;
        this.role = role!;
        this.hash = hash!;
        this.salt = salt!;
        this.registration_date = registration_date!;
    }

    
    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @Column({ type: "varchar", name: "email", length: 255, nullable: false })
    public email!: string;

    @CreateDateColumn({ type: "date", name: "registration_date", nullable: true, default: "NOW()" })
    public registration_date?: Date;

    @Column({ type: "enum", enum: RoleEnum, nullable: false })
    public role!: RoleEnum;

    @Column({ type: "varchar", name: "hash", length: 64, nullable: false })
    public hash!: string;

    @Column({ type: "varchar", name: "salt", length: 64, nullable: false })
    public salt!: string;

}