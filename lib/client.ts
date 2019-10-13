/**
 * Postgres Client
 */
import { cloneDeep } from 'lodash';
import { ISSEStream } from './stream';
import { ITigger } from './triggers';
import { Client } from 'pg';
import { isArray } from 'lodash';

interface IPGSubscribers {
    [key: string]: ISSEStream,
}

interface IPGSubList {
    [key: string]: IPGSubscribers,
}

export class PGPubSub {
    public client: Client;
    
    private listeners: IPGSubList = {};

    constructor(params: any) {
        let connection = cloneDeep(params);
        if (typeof connection === 'string') {
            connection = { connectionString: params };
        }
        this.client = connection ? new Client(connection) : new Client();
        try {
            this.client.connect();
        } catch (err) {
            throw new Error(err);
        };
    }

    public async init(path: string, funcs: string | string[], triggers: ITigger | ITigger[]) {
        let [schema, table] = path.split('.');
        if (!table) {
            table = schema;
            schema = 'public';
        }

        if (!isArray(funcs)) {
            funcs = [funcs];
        }

        if (!isArray(triggers)) {
            triggers = [triggers];
        }
        
        funcs.forEach(async(func) => await this.client.query(func));
        triggers.forEach(async({trigger, channel}) => {
            await this.client.query(trigger);
            await this.client.query(`LISTEN ${channel}`);
            this.listeners[`${schema}_${table}`] = {};
        });
    }
};
