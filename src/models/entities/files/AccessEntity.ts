import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Relation } from "typeorm";


@Entity({ name: "access", schema: "files" })
export default class AccessEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "file_id", nullable: false })
  file_id!: string;

  @Column({ type: "uuid", name: "user_id", nullable: false })
  user_id!: string;

}