/**
 * SSEConnector
 *  * Allows send notification to the client with SSE
 */
const { PassThrough } = require("stream");

export class SSEConnector {
    public res: any;

    constructor(res: any) {
        this.res = res;
    }

    public initStream() {
        typeof this.res.status === "function" ? this.res.status(200) : this.res.status = 200;
        this.res.set({
            "Content-Type": "text/event-stream;charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
        });
        this.res.body = new PassThrough();
        return this;
    }

    /**
     * Send message to the client
     * Can be used as a callback for subscription
     * @param payload: string - message for client
     * @param channel: string - event channel, not required
     */
    public send(payload: string = "", channel: string = null) {
        if (channel) {
            [channel, payload] = [payload, channel];
            this.res.body.write(`event: ${channel}\n`);
        }
        this.res.body.write(`data: ${payload}\n\n`);
        return this;
    }
}
