import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from "typeorm";

import AuthEntity from "./AuthEntity.js";

import RoleEnum from "../../../common/base/enum/RoleEnum.js";


@Entity({
    schema: "users",
    name: "user"
})
export default class UserEntity {

    constructor(auth_id: string, email: string, role: RoleEnum) {
        this.auth_id = auth_id;
        this.email = email;
        this.role = role;
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
        nullable: false,
        default: Date.now()
    })
    public registration_date!: Date;

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