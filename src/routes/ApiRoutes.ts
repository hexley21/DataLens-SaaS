import { getRoutes } from "../common/types/AppRoutes.js";

import apiIndexRouter from "./api/index.js";
import apiRegisterRouter from "./api/register.js";
import apiConfirmationRouter from "./api/activate.js";
import apiLoginRouter from "./api/login.js";
import apiResendRouter from "./api/reactivate.js";
import apiProfileRouter from "./api/profile.js";
import apiPasswordRouter from "./api/password.js"
import apiListRouter from "./api/list.js";
import apiEmployeeRouter from "./api/employee.js"
import apiSubscriptionRouter from "./api/subscription.js"
import apiBillingRouter from "./api/billing.js"
import apiFileRouter from "./api/file.js"


export default getRoutes({
    index: apiIndexRouter,
    register: apiRegisterRouter,
    activate: apiConfirmationRouter,
    login: apiLoginRouter,
    reactivate: apiResendRouter,
    profile: apiProfileRouter,
    password: apiPasswordRouter,
    list: apiListRouter,
    employee: apiEmployeeRouter,
    subscription: apiSubscriptionRouter,
    billing: apiBillingRouter,
    file: apiFileRouter,
});
