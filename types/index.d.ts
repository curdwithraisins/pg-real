/**
 * Types
 */
import { Client } from 'pg';
import { PassThrough } from 'stream';

export interface ITrigger {
    trigger: string,
    name: string,
}

export interface IFunction {
    function: string,
    channel: string,
}

export interface ISubClient extends Client {
    setFunctions(funcs: string | string[]): Promise<this | Error>,
    dropFunctions(funcsName: string | string[]): Promise<this | Error>,
    setTriggers(triggers: string | string[]): Promise<this | Error>,
    removeTriggers(triggersNames: string | string[], schema: string, table: string): Promise<this | Error>,
    setListeners(channels: string | string[]): Promise<this | Error>,
    removeListeners(channels: string | string[]): Promise<this | Error>,
    setNotifier(any): void,
}

interface ICallback {
    [cbId: string]: Function | PassThrough,
}
interface IPGSubList {
    [channel: string]: ICallback,
}