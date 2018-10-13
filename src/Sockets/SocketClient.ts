export default class SocketClient {
    private ws: WebSocket;

    constructor(url: string) {
        this.ws = new WebSocket(url);

        this.ws.onopen = (e: Event) => {
            console.log("websocket open");
        };

        this.ws.onclose = (e: Event) => {
            console.log("websocket closed");
        }

        this.ws.onerror = (e: Event) => {
            console.error("websocket error:",e);
        }

        this.ws.onmessage = (e: Event) => {
            console.log("websocket message:",e);
        }
    }
}