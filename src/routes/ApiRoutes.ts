import { getRoutes } from "../common/types/AppRoutes.js";

import apiIndexRouter from "./api/index.js";
import apiRegisterRouter from "./api/register.js";
import apiConfirmationRouter from "./api/activate.js"
import apiLoginRouter from "./api/login.js"
import apiResendRouter from "./api/reactivate.js"

export default getRoutes({
    index: apiIndexRouter,
    register: apiRegisterRouter,
    activate: apiConfirmationRouter,
    login: apiLoginRouter,
    reactivate: apiResendRouter
});
