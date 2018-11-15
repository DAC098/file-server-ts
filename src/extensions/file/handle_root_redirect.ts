import Middleware from "../../Routing/Middleware";
import { server_request, server_response } from "../../Server/Server";
import { handle_result } from "../../Routing/AbstractHandle";
import { RegExpOptions } from "path-to-regexp";

export default class handle_root_redirect extends Middleware {
    protected path = "/";
    protected path_options: RegExpOptions = {
        end: false
    };

    public async handleGet(request: server_request, response: server_response): Promise<handle_result> {
        if ("accept" in request.headers && request.headers["accept"].includes("text/html")) {
            response.writeHead(302, {"location": "/fs"});
            response.end();

            return handle_result.handled;
        }

        return handle_result.continue;
    }
}