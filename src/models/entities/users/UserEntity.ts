import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import Role from "../../../common/types/Role.js";
import AuthEntity from "./AuthEntity.js";


@Entity({
    schema: "users",
    name: "user"
})
export default class UserEntity {

    constructor(auth_id: string, email: string, role: Role) {
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

    @Column({
        type: "date",
        name: "registration_date",
        nullable: false,
        default: Date.now()
    })
    public registration_date!: Date;

    @Column({
        type: "enum",
        enum: Role,
        nullable: false
    })
    public role!: Role;


    @OneToOne(() => AuthEntity)
    @JoinColumn({
        name: "auth_id",
        referencedColumnName: "id"
    })
    auth?: AuthEntity

}