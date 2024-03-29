import { Request, Response, NextFunction } from "express";

import multer from "multer";
import path from "path";

import fs from "fs/promises"

import EmployeeController from "../controllers/users/EmployeeController.js";
import createHttpError from "http-errors";
import FileController from "../controllers/files/FileController.js";
import UserController from "../controllers/users/UserController.js";
import RoleEnum from "../models/entities/enum/RoleEnum.js";
import CompanyController from "../controllers/users/CompanyController.js";

export const uploadsFolder = path.join(__dirname, "../../../uploads")


function multerStorage(destination: string): multer.StorageEngine {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destination);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    });
}

function filter(...extensions: string[]) {
    return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {

        const uploadedExt = path.extname(file.originalname).toLowerCase().substring(1)

        if (extensions.includes(uploadedExt)) return cb(null, true);
        
        cb(createHttpError(400, "Unsupported file type!"));
    }
}

export  function uploadFile(...extensions: string[]) {

    return async (req: Request, res: Response, next: NextFunction) => {

        const user_id = res.locals.user_id;
        
        const user = (await UserController.findById(res.locals.user_id))!


        switch (user?.role ) {
            case RoleEnum.COMPANY:
                res.locals.company_id = (await CompanyController.findByUserId(user_id))!.id
                break;
            case RoleEnum.EMPLOYEE:
                res.locals.company_id = (await EmployeeController.findByUserId(user_id)).company_id
        }


        const uploadDirectory = `${uploadsFolder}/${user.email}`;

        await fs.mkdir(uploadDirectory, { recursive: true });
    
        let mutler =  multer({
            storage: multerStorage(uploadDirectory),
            fileFilter: filter(...extensions)
        }).single("file")
        
        
        return mutler(req, res, async (err) => {
            if (err) return next(err)
            if (!req.file) return next(createHttpError(500, "Could not upload file"))

            next()
        }) 
    
    }
};