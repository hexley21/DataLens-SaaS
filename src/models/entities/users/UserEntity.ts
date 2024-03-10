import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from "typeorm";

import AuthEntity from "./AuthEntity.js";

import RoleEnum from "../enum/RoleEnum.js";


@Entity({
    schema: "users",
    name: "user"
})
export default class UserEntity {

    constructor(auth_id?: string, email?: string, role?: RoleEnum, registration_date?: Date, ) {
        if (auth_id) this.auth_id = auth_id;
        if (email) this.email = email;
        if (role) this.role = role;
        if (registration_date) this.registration_date = registration_date;
    }

    
    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @Column({
        type: "uuid",
        name: "auth_id",
        nullable: false,
    })
    public auth_id!: string;

    @Column({
        type: "varchar",
        name: "email",
        length: 255,
        nullable: false,
    })
    public email!: string;

    @CreateDateColumn({
        type: "date",
        name: "registration_date",
        nullable: true,
        default: new Date()
    })
    public registration_date?: Date;

    @Column({
        type: "enum",
        enum: RoleEnum,
        nullable: false
    })
    public role!: RoleEnum;

    @OneToOne(() => AuthEntity)
    @JoinColumn({
        name: "auth_id",
        referencedColumnName: "id"
    })
    auth?: AuthEntity

}