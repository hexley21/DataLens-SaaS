import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";

import FileEntity from "./FileEntity.js";
import EmployeeEntity from "../users/EmployeeEntity.js";


@Entity({ name: "access", schema: "files" })
export class Access {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "file_id", nullable: false })
  file_id!: string;

  @Column({ type: "uuid", name: "employee_id", nullable: false })
  employee_id!: string;


  @ManyToOne(() => FileEntity)
  @JoinColumn({ name: "file_id" })
  file?: FileEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: "employee_id" })
  employee?: EmployeeEntity;
}