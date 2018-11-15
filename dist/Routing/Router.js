import AbstractHandle, { handle_result } from "./AbstractHandle";
export var route_result;
(function (route_result) {
    route_result[route_result["success"] = 1] = "success";
    route_result[route_result["not_found"] = 2] = "not_found";
    route_result[route_result["invalid_method"] = 3] = "invalid_method";
})(route_result || (route_result = {}));
;
export default class Router {
    constructor() {
        this.handles = [];
    }
    addHandle(handle) {
        if (handle instanceof AbstractHandle) {
            if (!handle.regexCreated())
                handle.processRegex();
            this.handles.push(handle);
        }
        else {
            throw new Error("invalid_handle");
        }
    }
    async run(request, response) {
        let path = request.url;
        let authority = request.headers[":authority"] || request.headers["host"];
        let scheme = request.headers[":scheme"] || "encrypted" in request.socket ? "https" : "http";
        let version = request.httpVersion;
        let method = request.method.toLowerCase();
        let req_url = new URL(path, `${scheme}://${authority}`);
        request["parsed_url"] = req_url;
        for (let h of this.handles) {
            let regex_result = h.execPath(req_url.pathname);
            this.current_handle = h;
            if (regex_result !== null) {
                request["params"] = h.getParams(regex_result);
                let result;
                switch (method) {
                    case "get":
                        result = await h.handleGet(request, response);
                        break;
                    case "post":
                        result = await h.handlePost(request, response);
                        break;
                    case "put":
                        result = await h.handlePut(request, response);
                        break;
                    case "delete":
                        result = await h.handleDelete(request, response);
                        break;
                    case "head":
                        result = await h.handleHead(request, response);
                        break;
                    default:
                        return route_result.invalid_method;
                }
                switch (result) {
                    case handle_result.handled:
                        return route_result.success;
                    case handle_result.unhandled:
                        return route_result.invalid_method;
                    case handle_result.continue:
                        break;
                    default:
                        throw new Error("unknown_handle_result");
                }
            }
        }
        return route_result.not_found;
    }
}
