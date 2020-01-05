import { PassThrough } from "stream";
import * as uuid from 'uuid';
import { PGClient } from '@lib/postgres/client';
import { isArray, cloneDeep, keys, values } from 'lodash';

interface ICallback {
    [cbId: string]: Function | PassThrough,
}
interface IPGSubList {
    [channel: string]: ICallback,
}

export class Subscription {
    private readonly client: PGClient;
    private listeners: IPGSubList = {};

    constructor(client: PGClient) {
        this.client = client;
    }

    public async startListen(channels: string | string[]) {
        if (!this.client) {
            return this;
        }
        let channelKeys = cloneDeep(channels);
        if (channelKeys) {
            if (!isArray(channelKeys)) {
                channelKeys = [channelKeys];
            }
            this.client.setListeners(channelKeys);
        }
        this.client.listen(this.notify.bind(this));
        return this;
    }

    public stopListen(channels: string | string[]) {
        if (!this.client) {
            return this;
        }
        let channelKeys = cloneDeep(channels);
        if (!channelKeys) {
            channelKeys = keys(this.listeners);
        }
        if (!isArray(channelKeys)) {
            channelKeys = [channelKeys];
        }
        channelKeys.forEach((channel) => {
            if (!this.listeners[channel]) {
                throw new Error('Channel doesn\'t exist.');
            }
            this.client.unlisten(channel);
            delete this.listeners[channel];
        });
        return this;
    }

    public subscribe(channel: string, cb: Function | PassThrough) {
        if (!this.listeners[channel]) {
            this.listeners[channel] = {};
        }
        const subscribers = this.listeners[channel];
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