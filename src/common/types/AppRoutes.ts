import { Router } from "express";


export type AppRoutes = {
    list: Router
    index: Router,
    register: Router,
    activate: Router,
    login: Router,
    reactivate: Router,
    profile: Router
};


export function getRoutes(apiRoutes: AppRoutes): Router {
    const router = Router();
    for (let r in apiRoutes) {
        // @ts-ignore
        router.use(`/${r}`, apiRoutes[r]);
    }
    router.use("/", apiRoutes.index);


    return router;
};
