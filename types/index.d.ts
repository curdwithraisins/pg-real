/**
 * Types
 */
import { Client } from 'pg';
import { PassThrough } from 'stream';

export interface ITriggerPath {
    schema: string,
    table: string,
    columns?: string[],
    triggerName?: string,
}

export interface ITriggerOptions {
    unique?: boolean,
    when?: boolean,
    before?: boolean,
    insert?: boolean,
    update?: boolean,
    delete?: boolean,
}

export interface ITrigger {
    trigger: string,
    name: string,
}

export interface IFunction {
    name: string,
    function: string,
    channel: string,
}

export interface ISubClient extends Client {
    setFunctions(funcs: string | string[]): Promise<this | Error>,
    dropFunctions(funcsName: string | string[]): Promise<this | Error>,
    setTriggers(triggers: string | string[]): Promise<this | Error>,
    dropTriggers(triggersNames: string | string[], schema: string, table: string): Promise<this | Error>,
    setListeners(channels: string | string[]): Promise<this | Error>,
    dropListeners(channels: string | string[]): Promise<this | Error>,
    setNotifier(any): void,
}

interface ICallback {
    [cbId: string]: Function | PassThrough,
}
interface IListeners {
    [channel: string]: ICallback,
}