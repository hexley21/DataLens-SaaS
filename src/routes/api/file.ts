import { Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError from "http-errors";

import authentication from "../../middlewares/authenticate.js";
import { isActive } from "../../middlewares/active.js";
import { uploadFile, uploadsFolder } from "../../middlewares/uploadFile.js";

import FileController from "../../controllers/files/FileController.js";
import FileAccessController from "../../controllers/files/FileAccessController.js";
import CompanyController from "../../controllers/users/CompanyController.js";
import { incrementFileCount } from "../../middlewares/subscription.js";


export default Router()
.post("/", authentication, isActive, incrementFileCount, uploadFile("csv", "xls", "xlsx"), async (req: Request, res: Response) => {

    await FileController.insert(res.locals.company_id, res.locals.user_id, req.file!.originalname, parseVisibleTo(req.query.visible_to as string | undefined))
  
    res.send(`File uploaded successfully: ${req.file!.originalname}`);
  })
.delete("/:name", authentication, isActive, async (req: Request, res: Response) => {

    const name = req.params.name
    const user_id = res.locals.user_id

    await FileController.delete(user_id, name)

    res.send(`file ${name} was deleted`);
})
.get("/", authentication, isActive, async (req: Request, res: Response) => {

    const email = req.query.email as string
    const name = req.query.name as string
    const page = req.query.page ? parseInt(req.query.page as string) : 1

    const company_id = await CompanyController.getCompanyIdIndependent(res.locals.user_id)

    let foundFiles = await FileController.findAccessibleFiles(company_id, res.locals.user_id, email, name, page)

    if (foundFiles.length != 1) {
        res.send(foundFiles)
        return;
    }

    res.download(`${uploadsFolder}/${foundFiles[0].owner}/${foundFiles[0].name}`, foundFiles[0].name)
})
.get("/access",  authentication, isActive, async (req: Request, res: Response) => {
    res.send(await FileAccessController.getFileAccess(res.locals.user_id))
})
.get("/access/:name", authentication, isActive, async (req: Request, res: Response) => {
    res.send(await FileAccessController.getFileAccess(res.locals.user_id, req.params.name))
})
.post("/access/:name", authentication, isActive, async (req: Request, res: Response,) => {
    const company_id = await CompanyController.getCompanyIdIndependent(res.locals.user_id)
    
    const foundFile = await FileController.findFilesOfOwner(res.locals.user_id, req.params.name);

    if (!foundFile) throw createHttpError(404, "File not found")

    await FileAccessController.addAccess(foundFile.id, company_id, parseVisibleTo(req.query.visible_to as string | undefined))

    res.redirect(`/api/file/access/${req.params.name}`)
})
.delete("/access/:name", authentication, isActive, async (req: Request, res: Response) => {
    const foundFile = await FileController.findFilesOfOwner(res.locals.user_id, req.params.name);

    if (!foundFile) throw createHttpError(404, "File not found")

    await FileAccessController.removeAccess(foundFile.id, res.locals.user_id, parseVisibleTo(req.query.visible_to as string | undefined))

    res.redirect(`/api/file/access/${req.params.name}`)
})



function parseVisibleTo(query?: string) {
    return query ? (query as string).replace(" ", "").split(',') : []
}
