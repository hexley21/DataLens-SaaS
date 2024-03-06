import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({
    schema: "users",
    name: "auth"
})
export default class AuthEntity {

    constructor(hash: string, salt: string) {
        this.hash = hash;
        this.salt = salt;
    }

    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @Column({
        type: "varchar",
        name: "hash",
        length: 64,
        nullable: false
    })
    public hash!: string;

    @Column({
        type: "varchar",
        name: "salt",
        length: 64,
        nullable: false
    })
    public salt!: string;

}
