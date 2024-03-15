import { Router } from "express";


export type AppRoutes = {
    list: Router
    index: Router,
    register: Router,
    activate: Router,
    login: Router,
    reactivate: Router,
    profile: Router,
    password: Router
    employee: Router,
    subscription: Router,
    billing: Router,
    file: Router
};


/**
 * concatetenates the string values of @AppRoutes type keys with slash
 * to easily assign every route to corresponding router
 * 
 * @returns master router which contains every other router from the type above
 */
export function getRoutes(apiRoutes: AppRoutes): Router {
    const masterRouter = Router();
    for (let r in apiRoutes) {
        // @ts-ignore
        masterRouter.use(`/${r}`, apiRoutes[r]);
    }
    masterRouter.use("/", apiRoutes.index);


    return masterRouter;
};
