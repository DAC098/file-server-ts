import Route from "./Route";
export var route_methods;
(function (route_methods) {
    route_methods["get"] = "get";
    route_methods["post"] = "post";
    route_methods["put"] = "put";
    route_methods["delete"] = "delete";
})(route_methods || (route_methods = {}));
export var route_types;
(function (route_types) {
    route_types["endpt"] = "endpt";
    route_types["mdlwr"] = "mdlwr";
})(route_types || (route_types = {}));
export default class Router {
    constructor() {
        this.routes = [];
    }
    setCurrentExtension(extension) {
        this.current_extension = extension;
    }
    addMdlwr(method, path, options, ...cb) {
        let new_route = new Route(this.current_extension, route_types.mdlwr, method, path, options, cb);
        this.routes.push(new_route);
    }
    addRoute(method, path, options, ...cb) {
        let new_route = new Route(this.current_extension, route_types.endpt, method, path, options, cb);
        this.routes.push(new_route);
    }
    async runRoute(route_cbs, request, response) {
        for (let cb of route_cbs) {
            let result = await cb(request, response);
            if (typeof result === "boolean") {
                if (result)
                    return true;
            }
        }
        return;
    }
    async run(request, response) {
        let path = request.url;
        let authority = request.headers[":authority"] || request.headers["host"];
        let scheme = request.headers[":scheme"] || "encrypted" in request.socket ? "https" : "http";
        let version = request.httpVersion;
        let method = request.method.toLowerCase();
        let req_url = new URL(path, `${scheme}://${authority}`);
        request["parsed_url"] = req_url;
        for (let route of this.routes) {
            let regex_result = route.execPath(req_url.pathname);
            this.current_route = route;
            if (regex_result !== null) {
                request["params"] = Route.getRegexpMapping(regex_result, route.keys);
                let result;
                let check_method = false;
                let ran_method = false;
                if (route.hasMethods()) {
                    check_method = true;
                    if (route.checkMethod(method)) {
                        ran_method = true;
                        result = await route.run(request, response);
                    }
                }
                else {
                    result = await route.run(request, response);
                }
                switch (route.type) {
                    case route_types.endpt:
                        if (typeof result === "boolean") {
                            if (check_method) {
                                if (ran_method && !result)
                                    return true;
                            }
                            else {
                                if (!result)
                                    return true;
                            }
                        }
                        else {
                            if (check_method) {
                                if (ran_method)
                                    return true;
                            }
                            else {
                                return true;
                            }
                        }
                        break;
                    case route_types.mdlwr:
                        if (typeof result === "boolean") {
                            if (result)
                                return true;
                        }
                        break;
                }
            }
        }
        return false;
    }
}
