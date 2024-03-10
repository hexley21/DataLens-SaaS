import IEncriptionService from "../common/interfaces/IEncriptionService.js";

import crypto from "crypto";


export class BasicEncriptionService implements IEncriptionService {
    saltLength: number = parseInt(process.env.SALT_LENGTH!);


    public async encryptPassword(password?: string, salt?: string, length?: number | undefined): Promise<string> | never {
        if (!password) throw TypeError("Null password")
        if (password.includes(" ")) throw TypeError("Password includes spaces")

        return new Promise<string>((resolve, reject) => {
            crypto.pbkdf2(
                password,
                salt ?? this.getSalt(length),
                1000,
                (length ?? this.saltLength) / 2,
                "sha512",
                (err, key) => {
                    if (err) reject(err);
                    else resolve(key.toString("hex"));
            })
        })
    }

    public getSalt(length?: number): string {
        return crypto.randomBytes((length ?? this.saltLength) / 2).toString("hex");
    }

}

export default new BasicEncriptionService()