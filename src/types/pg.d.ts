declare module 'pg' {
  export interface PoolConfig {
    connectionString?: string;
    ssl?: boolean | { rejectUnauthorized?: boolean };
    connectionTimeoutMillis?: number;
    idleTimeoutMillis?: number;
    max?: number;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query(sql: string, values?: any[]): Promise<QueryResult>;
    end(): Promise<void>;
    on(event: string, callback: (...args: any[]) => void): void;
  }

  export interface QueryResult {
    rows: any[];
    rowCount: number;
  }
}
