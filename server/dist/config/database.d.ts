import { PoolClient, QueryResult, QueryResultRow } from 'pg';
export declare function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
export declare function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T>;
export declare function testDatabase(): Promise<boolean>;
export declare function closeDatabase(): Promise<void>;
//# sourceMappingURL=database.d.ts.map