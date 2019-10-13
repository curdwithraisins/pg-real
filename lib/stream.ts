import { Stream } from "stream";

/**
 * Stream for updates
 */
import { PassThrough } from 'stream';
import * as uuid from 'uuid';

export interface ISSEStream extends PassThrough {
    id: string,
}

export class SSEStream extends PassThrough implements ISSEStream {
    public id: string = '';

    constructor() {
        super();
        this.id = uuid();
    }
}