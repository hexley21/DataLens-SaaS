import { Column, Entity, PrimaryColumn } from "typeorm";


@Entity("industries")
export default class IndustriesEntity {

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }


    @PrimaryColumn({
        type: "varchar",
        name: "id",
        length: 8,
        nullable: false
    })
    public id!: string

    @Column({
        type: "varchar",
        name: "name",
        length: 64,
        nullable: false
    })
    public name!: string

}
