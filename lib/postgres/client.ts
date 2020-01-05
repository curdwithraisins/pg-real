/**
 * Postgres Client
 */
import { cloneDeep } from 'lodash';
import { ITigger } from '@lib/postgres/triggers';
import { Client } from 'pg';
import { isArray } from 'lodash';

export class PGClient {
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

    public setTriggers(triggers: string | string[]) {
        let list = cloneDeep(triggers);
        if (!isArray(list)) {
            list = [list]
        }
        this.client.connect();
        list.forEach(async (trigger) => {
            await this.client.query(trigger);
        });
        this.client.end();
        return this;
    }

    public setListeners(channels: string | string[]) {
        let list = cloneDeep(channels);
        if (!isArray(list)) {
            list = [list];
        }
        this.client.connect();
        list.forEach(async (channel: string) => {
            await this.client.query(`LISTEN ${channel}`);
        });
        this.client.end();
        return this;
    }

    public setTriggersAndListeners(triggers: ITigger | ITigger[]) {
        let list = cloneDeep(triggers);
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

    public unlisten(channel: string) {
        this.client.query(`UNLISTEN ${channel}`);
    }

    public async query(query: string) {
        this.client.connect();
        await this.client.query(query);
        this.client.end();
    }
};