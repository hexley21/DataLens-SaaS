
import CountriesEntity from "../models/entities/CountriesEntity.js";
import IndustriesEntity from "../models/entities/IndustriesEntity.js";

import UserEntity from "../models/entities/users/UserEntity.js";
import AuthEntity from "../models/entities/users/AuthEntity.js";
import CompanyEntity from "../models/entities/users/CompanyEntity.js";
import EmployeeEntity from "../models/entities/users/EmployeeEntity.js";

import RecordEntity from "../models/entities/subscription/RecordEntity.js";
import TierEntity from "../models/entities/subscription/TierEntity.js";
import { DataSource } from "typeorm";


export default new DataSource({
    type: "postgres",
    host: "localhost",
    port: parseInt(process.env.DB_PORT!),
    username: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
    synchronize: false,
    uuidExtension: 'uuid-ossp',
    logging: true,
    entities: [ IndustriesEntity, CountriesEntity, UserEntity, AuthEntity, CompanyEntity, EmployeeEntity, RecordEntity, TierEntity ],
    subscribers: [],
    migrations: []
});
