/**
 * HttpConnector
 * Allows send notification to the client with http
 */

export class HttpConnector {
    private res: any;

    constructor(res: any) {
        this.res = res;
    }

    /**
     * Send message to the client
     * Can be used as a callback for subscription
     * @param payload: string = message for client
     * @param channel: string - event channel, not required
     */
    public send(payload: string = "", channel: string = null) {
        this.res.status(200);
        this.res.setHeader("Access-Control-Allow-Origin", "*");
        this.res.setHeader("Cache-Control", "no-cache");
        if (channel) {
            [channel, payload] = [payload, channel];
        }
        return `${channel ? "event: " + channel + "; data: " : ""}${payload}`;
    }
}
