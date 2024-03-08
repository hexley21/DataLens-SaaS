import IEncriptionService from "../common/base/IEncriptionService.js";

import crypto from "crypto";


export default class BasicEncriptionService implements IEncriptionService {
    saltLength: number = parseInt(process.env.SALT_LENGTH!);


    public async encryptPassword(password: string, salt?: string, length?: number | undefined): Promise<string | never> {
    if (!password) throw Error("Null password")
        if (password.includes(" ")) throw Error("Password includes spaces")

        if (!salt) salt = this.getSalt(length)

        return crypto.pbkdf2Sync(password, salt, 1000, (length ?? this.saltLength) / 2, "sha512").toString("hex");
    }

    public getSalt(length?: number): string {
        return crypto.randomBytes((length ?? this.saltLength) / 2).toString("hex");
    }

}