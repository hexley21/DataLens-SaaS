import { EntityTarget, ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";

import JoinOptions from "../types/JoinOptions.js";


export default abstract class Controller<T extends ObjectLiteral> {
    private repository: Repository<T>
    private alias: string

    constructor(repository: Repository<T>, alias: string) {
        this.repository = repository
        this.alias = alias;
    }


    public async get(...joinOptions: JoinOptions[]) {
        const query = this.createQueryBuilder()

        if (joinOptions) this.addJoinOptions(query)

        return await query
        .select()
        .getMany()
    }

    public async save(...value: T[]): Promise<T[]> {
        return (await this.createQueryBuilder()
            .insert()
            .values(value)
            .returning("*")
            .execute())
            .generatedMaps as T[]
    }

    public async findOneBy(options: any[] | any, ...joinOptions: JoinOptions[]): Promise<T | null> {
        const query = this.createQueryBuilder()

        if (joinOptions) this.addJoinOptions(query)

        return await query
        .select()
        .where(options)
        .getOne()
    }

    public async findBy(options: any[] | any, ...joinOptions: JoinOptions[]): Promise<T[]> {
        const query = this.createQueryBuilder()

        if (joinOptions) this.addJoinOptions(query)

        return await query
        .select()
        .where(options)
        .getMany()
    }

    protected async countBy(...options: any[]): Promise<number> {
        return await this.createQueryBuilder(this.alias).select().where(options).getCount()
    }


    public async deleteBy(...options: any[]): Promise<T[]> {
        return (await this.createQueryBuilder(this.alias)
            .delete()
            .where(options)
            .returning("*")
            .execute())
            .raw
    }

    public async updateBy(patch: QueryDeepPartialEntity<T>, ...options: any[]): Promise<T> {
        return (await this.createQueryBuilder(this.alias)
            .update()
            .set(patch)
            .where(options)
            .returning("*")
            .execute())
            .raw
    }


    protected createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
        return this.repository.createQueryBuilder(alias ?? this.alias)
    }

    protected createTypedQueryBuilder<R extends ObjectLiteral>(type: EntityTarget<R>, alias?: string): SelectQueryBuilder<R> {
        return this.repository.manager.createQueryBuilder<R>(type, alias ?? this.alias)
    }

    protected addJoinOptions<R extends ObjectLiteral>(queryBuilder: SelectQueryBuilder<R>, ...joinOptions: JoinOptions[]) {
        if (joinOptions) {
            for (let i of joinOptions) {
                queryBuilder.leftJoinAndSelect(`${queryBuilder.alias}.${i.relation}`, i.alias)
            }
        }
        
        return queryBuilder
    }

}
