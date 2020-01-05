/**
 * Postgres Client
 */
import { cloneDeep } from 'lodash';
import { ITigger } from '@lib/postgres/triggers';
import { Client } from 'pg';
import { isArray } from 'lodash';

export default class PGClient {
    private client!: Client;

    public createClient(params: string | object | undefined) {
        let connection = cloneDeep(params);
        if (typeof connection === 'string') {
            connection = { connectionString: params };
        }
        this.client = connection ? new Client(connection) : new Client();
        return this;
    }

    public setClient(client: Client) {
        this.client = client;
        return this;
    }

    public async setFunctions(funcs: string | string[]) {
        if (isArray(funcs)) {
            funcs = [funcs].join('\n');
        }

        this.client.connect();
        await this.client.query(funcs);
        this.client.end();
        return this;
    }

    public setTriggers(triggers: ITigger | ITigger[]) {
        if (!isArray(triggers)) {
            triggers = [triggers]
        }
        this.client.connect();
        triggers.forEach(async ({trigger, channel}) => {
            await this.client.query(trigger);
            await this.client.query(`LISTEN ${channel}`);
        });
        this.client.end();
        return this;
    }

    public listen(notify: any) {
        this.client.connect();
        this.client.on('notification', notify);
    }

    public async query(query: string) {
        this.client.connect();
        await this.client.query(query);
        this.client.end();
    }
};