/**
 * SSEConnector
 */
const { PassThrough } = require("stream");

export class SSEConnector {
    private res: any;

    constructor(res: any) {
        this.res = res;
    }

    public initStream() {
        this.res.status(200);
        this.res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
        this.res.setHeader("Access-Control-Allow-Origin", "*");
        this.res.setHeader("Cache-Control", "no-cache");
        this.res.body = PassThrough.create();
        return this.res.body;
    }

    /**
     * Send message to the client
     * Use this function for subscription
     * @param payload: string - message for client
     * @param channel: string - event channel, not required
     */
    public send(payload: string = "", channel: string = null) {
        if (channel) {
            this.res.body.write(`event: ${channel}\n`);
        }
        this.res.body.write(`data: ${payload}\n\n`);
    }
}
