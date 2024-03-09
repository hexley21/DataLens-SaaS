import AppDataSource from "../data/AppDataSource.js";

import IController from "../common/interfaces/IController.js";

import EmployeeEntity from "../models/entities/users/EmployeeEntity.js";


export class EmployeeController extends IController<EmployeeEntity> {

    constructor() {
        super(AppDataSource.getRepository(EmployeeEntity), "e");
    }
    

}


export default new EmployeeController();
