import DbHandler from "../../src/common/handlers/DbHandler.js";

import CountriesEntity from "../../src/models/entities/CountriesEntity.js";
import IndustriesEntity from "../../src/models/entities/IndustriesEntity.js";

import UserEntity from "../../src/models/entities/users/UserEntity.js";
import AuthEntity from "../../src/models/entities/users/AuthEntity.js";
import CompanyEntity from "../../src/models/entities/users/CompanyEntity.js";
import EmployeeEntity from "../../src/models/entities/users/EmployeeEntity.js";

import BillingRecordEntity from "../../src/models/entities/subscription/BillingRecordEntity.js";
import PlanEntity from "../../src/models/entities/subscription/PlanEntity.js";


export default new DbHandler({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "datalens_test",
    synchronize: false,
    logging: true,
    entities: [ IndustriesEntity, CountriesEntity, UserEntity, AuthEntity, CompanyEntity, EmployeeEntity, BillingRecordEntity, PlanEntity ],
    subscribers: [],
    migrations: []
});
