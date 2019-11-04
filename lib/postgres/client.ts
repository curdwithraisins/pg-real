/**
 * Postgres Client
 */
import { cloneDeep } from 'lodash';
import { IStream } from '@lib/stream';
import { ITigger } from '@lib/postgres/triggers';
import { Client } from 'pg';
import { isArray, keys, values } from 'lodash';

interface ICallback extends Function {
    callbackId: string;
}
interface ICallback {
    [cbId: string]: Function,
}
interface IPGSubList {
    [channel: string]: ICallback,
}
export class PGSubscriber {
    private client!: Client;
    private listeners: IPGSubList = {};

    /**
     * Create client and connection to Postgres
     * @param params
     * @returns {this}
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
     * @param client
     * @returns {this}
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
     * @returns {Promise<string[]>} - list of channels
     */
    public async initSubscribtions(path: string, funcs: string | string[], triggers: ITigger | ITigger[]) {
        if (!this.client) {
            return this;
        }
        try {
            // Connect to the client
            this.client.connect();

            if (!isArray(funcs)) {
                funcs = [funcs].join('\n');
            }

            if (!isArray(triggers)) {
                triggers = [triggers]
            }

            // Create functions
            await this.client.query(<string>funcs);
            
            // Set triggers
            triggers.forEach(async ({ trigger, channel }) => {
                await this.client.query(trigger);
                await this.client.query(`LISTEN ${channel}`);
                this.listeners[channel] = {};
            });

            this.client.on('notification', this.notify.bind(this));

            return keys(this.listeners);
        } catch (err) {
            throw new Error(err);
        };
    }

    public subscribe(channel: string, cb: Function) {
        const subscribers = this.listeners[channel];
        if (!subscribers) {
            throw new Error('Channel doesn\'t exist.');
        }
        subscribers[cb.callbackId] = cb;
    }

    public unsubscribe(channel: string, cbId: string) {
        const subscribers = this.listeners[channel];
        if (!subscribers) {
            throw new Error('Channel doesn\'t exist.');
        }
        delete subscribers[cb.callbackId];
    }

    private notify(data: any) {
        const { channel: string, payload: any } = data;
        values(this.listeners[channel]).forEach((cb: Function) => {
            cb(channel, payload);
        });  
    }
};