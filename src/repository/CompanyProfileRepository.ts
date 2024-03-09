import IProfileRepository from "../common/interfaces/repository/IProfileRepository.js";
import CompanyEntity from "../models/entities/users/CompanyEntity.js";


export default class CompanyProfileRepository implements IProfileRepository<CompanyEntity> {
    
    getProfile(): CompanyEntity {
        throw new Error("Method not implemented.");
    }


}