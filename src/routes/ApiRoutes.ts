import { getRoutes } from "../common/types/AppRoutes.js";

import apiIndexRouter from "./api/index.js";
import apiRegisterRouter from "./api/register.js";


export default getRoutes({
    index: apiIndexRouter,
    register: apiRegisterRouter,
});
