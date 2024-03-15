import jwt from "jsonwebtoken";


export function signObjToken(obj: any, expiresIn?: string, accessToken?: string): string {
    if (!expiresIn) expiresIn = process.env.TOKEN_EXPIRATION!
    if (!accessToken) accessToken = process.env.ACCESS_TOKEN!
    
    return jwt.sign(obj, accessToken, { expiresIn: expiresIn });
}

export function verifyToken(token: string, accessToken?: string): jwt.JwtPayload {
    if (!accessToken) accessToken = process.env.ACCESS_TOKEN!

    return jwt.verify(token, accessToken) as jwt.JwtPayload
}