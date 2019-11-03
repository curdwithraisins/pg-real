import { Stream } from "stream";

/**
 * Stream for updates
 */
import { PassThrough } from 'stream';
import * as uuid from 'uuid';

export interface IStream extends PassThrough {
    id: string,
}

export class CustomStream extends PassThrough implements IStream {
    public id: string = '';

    constructor() {
        super();
        this.id = uuid();
    }
}