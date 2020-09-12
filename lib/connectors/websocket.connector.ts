/**
 * SocketConnector
 * Allows send notification to the client with sockets
 */

export class SocketConnector {
    private socket: any;

    constructor(socket: any) {
        this.socket = socket;
    }

    /**
     * Send message to the client
     * Can be used as a callback for subscription
     * @param payload: string = message for client
     * @param channel: string - event channel, not required
     */
    public send(payload: string = "", channel: string = null) {
        if (channel) {
            [channel, payload] = [payload, channel];
        }
        this.socket.emit(`${channel ? "event: " + channel + "; data: " : ""}${payload}`);
    }
}
