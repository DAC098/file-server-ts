export default class SocketClient {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.ws.onopen = (e) => {
            console.log("websocket open");
        };
        this.ws.onclose = (e) => {
            console.log("websocket closed");
        };
        this.ws.onerror = (e) => {
            console.error("websocket error:", e);
        };
        this.ws.onmessage = (e) => {
            console.log("websocket message:", e);
        };
    }
}
