/**
 * HttpConnector
 */

export class HttpConnector {
    private res: any;

    constructor(res: any) {
        this.res = res;
    }

    public initStream() {
        this.res.status(200);
        this.res.setHeader('Access-Control-Allow-Origin', '*');
        this.res.setHeader('Cache-Control', 'no-cache');
        return this.res.body;
    }

    /**
     * Send message to the client
     * @param payload: string = message for client
     * @param channel: string - event channel, not required
     */
    public send(payload: string = "", channel: string = null) {
        this.res.body = `${channel ? 'event: ' + channel + '; ' : ''}data: ${payload}`;
    }
}