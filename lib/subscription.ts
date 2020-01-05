import { PassThrough } from "stream";
import * as uuid from 'uuid';
import { ITigger } from '@lib/postgres/triggers';
import PGClient from '@lib/postgres/client';
import { keys, values } from 'lodash';

interface ICallback {
    [cbId: string]: Function | PassThrough,
}
interface IPGSubList {
    [channel: string]: ICallback,
}

export default class Subscription {
    private readonly client: PGClient;
    private listeners: IPGSubList = {};

    constructor(client: PGClient) {
        this.client = client;
    }

    public async listen(funcs: string | string[], triggers: ITigger | ITigger[]) {
        if (!this.client) {
            return this;
        }
        if (funcs) {
            this.client.setFunctions(funcs);
        }
        if (triggers) {
            this.client.setTriggers(triggers);
        }
        // Connect to the client
        this.client.listen(this.notify.bind(this));
        return keys(this.listeners);
    }

    public async unlisten(channel: string) {
        const subscribers = this.listeners[channel];
        if (!subscribers) {
            throw new Error('Channel doesn\'t exist.');
        }
        await this.client.query(`UNLISTEN ${channel}`);
    }

    public subscribe(channel: string, cb: Function | PassThrough) {
        const subscribers = this.listeners[channel];
        if (!subscribers) {
            this.listeners[channel] = {};
        }
        const cbId = uuid();
        subscribers[cbId] = cb;
        return cbId;
    }

    public unsubscribe(channel: string, cbId: string) {
        const subscribers = this.listeners[channel];
        if (!subscribers) {
            throw new Error('Channel doesn\'t exist.');
        }
        delete subscribers[cbId];
    }

    private notify(data: any) {
        let {channel, payload} = data;
        values(this.listeners[channel]).forEach((cb: Function | PassThrough) => {
            if (typeof cb == 'function') {
                cb(channel, payload);
            } else {
                cb.write(`event: ${channel}\n`);
                cb.write(`data: ${payload}\n\n`);
            }
        });
    }
}