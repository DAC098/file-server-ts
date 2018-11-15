import Middleware from "../../Routing/Middleware";
import { handle_result } from "../../Routing/AbstractHandle";
export default class handle_root_redirect extends Middleware {
    constructor() {
        super(...arguments);
        this.path = "/";
        this.path_options = {
            end: false
        };
    }
    async handleGet(request, response) {
        if ("accept" in request.headers && request.headers["accept"].includes("text/html")) {
            response.writeHead(302, { "location": "/fs" });
            response.end();
            return handle_result.handled;
        }
        return handle_result.continue;
    }
}
