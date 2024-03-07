import { ObjectLiteral } from "typeorm"

type JoinOptions = {
    relation: string,
    alias: string,
    condition?: string,
    parameters?: ObjectLiteral
}


export default JoinOptions
