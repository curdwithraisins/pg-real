import { PassThrough } from "stream";

export interface ITrigger {
    trigger: string,
    channel: string,
}

interface ICallback {
    [cbId: string]: Function | PassThrough,
}
interface IPGSubList {
    [channel: string]: ICallback,
}