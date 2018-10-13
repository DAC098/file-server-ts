import Extension from "../Server/Extension";
import { uuidV4Str } from "../security/uuid";
import { createHash } from "crypto";
export default class socket_handle extends Extension {
    constructor() {
        super(...arguments);
        this.connected_sockets = [];
        this.uuid = uuidV4Str();
        this.connection_uuid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    }
    getName() {
        return "socket_handle";
    }
    getResponseKey(given_key) {
        let buf_concat = Buffer.from(given_key + this.connection_uuid);
        let sha1_hash = createHash("sha1");
        sha1_hash.update(buf_concat);
        let response_key = sha1_hash.digest();
        return response_key;
    }
    async load(server) {
        server.router.addMdlwr(null, "/", {}, async (request, response) => {
            if (request.headers["upgrade"] === "websocket") {
                console.log("requesting socket upgrade for websockets");
                let response_key = this.getResponseKey(request.headers["sec-websocket-key"]);
                response.writeHead(101, {
                    upgrade: "websocket",
                    connection: "upgrade",
                    "Sec-WebSocket-Accept": response_key.toString("base64")
                });
                response.end();
                return true;
            }
        });
    }
}
