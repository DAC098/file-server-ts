import Extension from "../Server/Extension";
import Server from "../Server/Server";
import { route_request } from "../Routing/Router";
import { Http2ServerResponse } from "http2";
import { Socket } from "net";
import uuidV4, { uuidV4Str, uuidV4StrToBuffer} from "../security/uuid";
import { createHash } from "crypto";

export default class socket_handle extends Extension {
    public connected_sockets: Socket[] = [];
    public uuid: string = uuidV4Str();
    public connection_uuid: string = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    getName(): string {
        return "socket_handle";
    }

    getResponseKey(given_key: string): Buffer {
        let buf_concat = Buffer.from(given_key + this.connection_uuid);
        let sha1_hash = createHash("sha1");

        sha1_hash.update(buf_concat);

        let response_key = sha1_hash.digest();

        return response_key;
    }

    async load(server: Server): Promise<void> {
        server.router.addMdlwr(
            null,
            "/",
            {},
            async (request: route_request, response: Http2ServerResponse): Promise<void|boolean> => {
                if(request.headers["upgrade"] === "websocket") {
                    console.log("requesting socket upgrade for websockets");

                    let response_key = this.getResponseKey(<string>request.headers["sec-websocket-key"]);

                    response.writeHead(101,{
                        upgrade: "websocket",
                        connection: "upgrade",
                        "Sec-WebSocket-Accept": response_key.toString("base64")
                    });

                    response.end();

                    return true;
                }
            }
        )
    }
}