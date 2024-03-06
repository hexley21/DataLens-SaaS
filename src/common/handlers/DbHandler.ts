import { DataSource, DataSourceOptions, EntityTarget, ObjectLiteral, Repository } from "typeorm";


export default class DbHandler {

    private dataSource: DataSource;

    constructor(dataSourceOptions: DataSourceOptions) {
        this.dataSource = new DataSource(dataSourceOptions);
    }

    public async close(): Promise<void> {
        await this.dataSource.destroy();
    
        console.log("DataSource has been distroyed");
    }
    
    public async initialize(): Promise<DataSource> {
        await this.dataSource.initialize();
    
        console.log("Database has been initialized");
    
        return this.dataSource;
    }

    public get connection(): DataSource {
        return this.dataSource;
    }

    public getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
        return this.dataSource.getRepository(entity);
    }
    
}
