import { PassThrough } from "stream";
import * as uuid from 'uuid';
import { SubscriptionClient } from '@lib/postgres/client';
import { isArray, cloneDeep, keys, values } from 'lodash';
import { IPGSubList } from '@pack-types/index';

export class Index {
    private readonly client: SubscriptionClient;
    private listeners: IPGSubList = {};

    constructor(client: SubscriptionClient) {
        this.client = client;
    }

    public startListen() {
        if (!this.client) {
            return this;
        }
        this.client.startListen(notify.bind(this));
        return this;
    }

    public async stopListen() {
        if (!this.client) {
            return this;
        }
        let channelKeys = keys(this.listeners);
        await this.client.removeListeners(channelKeys);
        this.listeners = {};
        return this;
    }

    public subscribe(channel: string, cb: Function | PassThrough) {
        if (!channel || !cb) {
            throw new Error('Require channel and callback.');
        }
        if (!this.listeners[channel]) {
            this.listeners[channel] = {};
        }
        const subscribers = this.listeners[channel];
        const cbId = uuid();
        subscribers[cbId] = cb;
        return cbId;
    }

    public unsubscribe(channels: string | string[], cbId: string) {
        let channelKeys = cloneDeep(channels);
        if (!channelKeys) {
            channelKeys = keys(this.listeners);
        }
        if (!isArray(channelKeys)) {
            channelKeys = [channelKeys];
        }
        channelKeys.forEach((channel) => {
            if (!this.listeners[channel]) {
                throw new Error(`Channel ${channel} doesn\'t exist.`);
            }
            cbId ? delete this.listeners[channel][cbId] : delete this.listeners[channel];
        });
        return this;
    }
}

const notify = (data: any) => {
    let {channel, payload} = data;
    values(this.listeners[channel]).forEach((cb: Function | PassThrough) => {
        if (typeof cb == 'function') {
            cb(channel, payload);
        } else {
            cb.write(`event: ${channel}\n`);
            cb.write(`data: ${payload}\n\n`);
        }
    });
};