export default interface IEncriptionRepository {
    saltLength: number
    

    encryptPassword(password?: string, salt?: string, length?: number): Promise<string | never>

    getSalt(length?: number): string

};
