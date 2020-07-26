/**
 * Subscriber
 */
import { SubClient } from "@lib/postgres/client";
import { IListeners } from "@pack-types/index";
import { cloneDeep, isArray, keys, values } from "lodash";
import { PassThrough } from "stream";
import * as uuid from "uuid";

export class Subscriber {
    private readonly client: SubClient;
    private listeners: IListeners = {};

    constructor(client: SubClient) {
        if (!client) {
            throw new Error("Client is not provided.");
        }
        this.client = client;
        this.client.setNotifier(notify.bind(this));
    }

    /**
     * Start listen to channels
     * @param channels: string | string[]
     */
    public async startListen(channels: string | string[]) {
        if (!channels || !channels.length) {
            throw Error("Provide channels names to start listen to.");
        }
        let channelsKeys = cloneDeep(channels);
        if (!isArray(channelsKeys)) {
            channelsKeys = [channelsKeys];
        }
        await this.client.setListeners(channelsKeys);
        channelsKeys.forEach((key) => {
            if (!this.listeners[key]) {
                this.listeners[key] = {};
            }
        });
        return this;
    }

    /**
     * Stop listen to one, several or all channels and notify when one of those events occurs
     * @param channels: string | string[] - channel name or list of names
     */
    public async stopListen(channels: string | string[] = null) {
        let channelsKeys = cloneDeep(channels);
        channelsKeys = channelsKeys || keys(this.listeners);
        if (!isArray(channelsKeys)) {
            channelsKeys = [channelsKeys];
        }
        await this.client.removeListeners(channelsKeys);
        channelsKeys.forEach((key) => {
            delete this.listeners[key];
        });
        return this;
    }

    /**
     * Subscribe to channel and set a corresponding callback
     * @param channel: string | string[]  - channel name of list of names
     * @param cb: Function | PassThrough - callback function or stream
     * @return callback id, used for unsubscription
     */
    public subscribe(channel: string | string[], cb: Function | PassThrough): string | string[] {
        if (!channel || !channel.length || !cb) {
            throw new Error("Require channel and callback.");
        }
        let channelsList = cloneDeep(channel);
        if (!isArray(channelsList)) {
            channelsList = [channelsList];
        }
        const cbIds = [];
        channelsList.forEach((name) => {
            if (!this.listeners[name]) {
                this.listeners[name] = {};
            }
            const cbId = uuid();
            cbIds.push(cbId);
            this.listeners[name][cbId] = cb;
        });
        return cbIds.length === 1 ? cbIds[0] : cbIds;
    }

    /**
     * Unsubscribe from channel
     * @param channels: string | string[] - one or several channels, all channels if not provided
     * @param cbId: string | string[] - callback id, remove all callbacks from channels listeners if not provided
     */
    public unsubscribe(channels: string | string[] = null, cbId: string | string[] = null) {
        let channelKeys = cloneDeep(channels);
        if (!channelKeys) {
            channelKeys = keys(this.listeners);
        }
        if (!isArray(channelKeys)) {
            channelKeys = [channelKeys];
        }
        let callbacks = cloneDeep(cbId);
        if (!callbacks) {
            callbacks = [];
        }
        if (!isArray(callbacks)) {
            callbacks = [callbacks];
        }
        channelKeys.forEach((channel) => {
            if (!this.listeners[channel]) {
                throw new Error(`Channel ${channel} does not exist.`);
            }
            // @ts-ignore
            !callbacks.length ? delete this.listeners[channel] : callbacks.forEach((cb) => {
                if (this.listeners[channel][cb]) {
                    delete this.listeners[channel][cb];
                }
            });
        });
        return this;
    }
}

const notify = (data: any) => {
    const {channel, payload} = data;
    values(this.listeners[channel]).forEach((cb: Function | PassThrough) => {
        if (typeof cb === "function") {
            cb(channel, payload);
        } else {
            cb.write(`event: ${channel}\n`);
            cb.write(`data: ${payload}\n\n`);
        }
    });
};
