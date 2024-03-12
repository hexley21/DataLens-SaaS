export default interface IFileManager {
    deleteFile(email: string, fileName: string): Promise<void>;
}