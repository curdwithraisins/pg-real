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

export class PGSubscriber {
    private client!: Client;
    private listeners: IPGSubList = {};

    /**
     * Create client and connection to Postgres. Return this.
     * @param params - connection params. Can be undefined if global params are used. 
     */
    public createClient(params: string | object | undefined) {
        let connection = cloneDeep(params);
        if (typeof connection === 'string') {
            connection = { connectionString: params };
        }
        this.client = connection ? new Client(connection) : new Client();
        return this;
    }

    /**
     * Set Postgres client. Return this.
     * @param client - Postgres client.
     */
    public setClient(client: Client) {
        this.client = client;
        return this;
    }

    /**
     * Initiate triggers and functions
     * @param path - implisit path to table including schema. By default, schema = public
     * @param funcs - list of functions
     * @param triggers - list of triggers
     */
    public async init(path: string, funcs: string | string[], triggers: ITigger | ITigger[]) {
        if (!this.client) {
            return this;
        }
        try {
            this.client.connect();

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

            funcs.forEach(async (func) => await this.client.query(func));
            triggers.forEach(async ({ trigger, channel }) => {
                await this.client.query(trigger);
                await this.client.query(`LISTEN ${channel}`);
                this.listeners[channel] = {};
            });
        } catch (err) {
            throw new Error(err);
        };
    }
};
