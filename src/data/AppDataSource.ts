import DbHandler from "../common/handlers/DbHandler.js";

import CountriesEntity from "../models/entities/CountriesEntity.js";
import IndustriesEntity from "../models/entities/IndustriesEntity.js";

import UserEntity from "../models/entities/users/UserEntity.js";
import AuthEntity from "../models/entities/users/AuthEntity.js";
import CompanyEntity from "../models/entities/users/CompanyEntity.js";
import EmployeeEntity from "../models/entities/users/EmployeeEntity.js";

import BillingRecordEntity from "../models/entities/subscription/BillingRecordEntity.js";
import PlanEntity from "../models/entities/subscription/PlanEntity.js";


export default new DbHandler({
    type: "postgres",
    host: "localhost",
    port: parseInt(process.env.DB_PORT!),
    username: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
    synchronize: false,
    uuidExtension: 'uuid-ossp',
    logging: true,
    entities: [ IndustriesEntity, CountriesEntity, UserEntity, AuthEntity, CompanyEntity, EmployeeEntity, BillingRecordEntity, PlanEntity ],
    subscribers: [],
    migrations: []
});
