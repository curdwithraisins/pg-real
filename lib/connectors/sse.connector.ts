/**
 */
const { PassThrough } = require('stream');

export default class SseConnector {
    private res: any;

    constructor(res: any) {
        this.res = res;
    }

    public initStream() {
        this.res.status(200);
        this.res.setHeader('Content-Type', 'text/event-stream;charset=utf-8');
        this.res.setHeader('Access-Control-Allow-Origin', '*');
        this.res.setHeader('Cache-Control', 'no-cache');
        this.res.body = PassThrough.create();
        return this.res.body;
    }

    public write(payload: string = "", channel: string) {
        if (channel) {
            this.res.body.write(`event: ${channel}\n`);
        }
        this.res.body.write(`data: ${payload}\n\n`);
    }
}