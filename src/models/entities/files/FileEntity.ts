import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";

import CompanyEntity from "../users/CompanyEntity.js";
import EmployeeEntity from "../users/EmployeeEntity.js";


@Entity({ schema: "files", name: "file" })
export default class File {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "company_id", nullable: true })
  company_id?: string;

  @Column({ type: "uuid", name: "employee_id", nullable: true })
  employee_id?: string;

  @Column({ type: "varchar", name: "file_name", length: 64, nullable: false })
  file_name!: string;

  @Column({ type: "varchar", name: "file_path", length: 64, nullable: false })
  file_path!: string;

  @CreateDateColumn({ type: "date", name: "upload_date", nullable: false})
  upload_date!: Date;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: "company_id" })
  company?: CompanyEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: "employee_id" })
  employee?: EmployeeEntity;
}
