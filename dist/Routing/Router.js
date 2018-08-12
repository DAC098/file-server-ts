// @ts-ignore
import pathToRegexp from 'path-to-regexp';
export var route_methods;
(function (route_methods) {
    route_methods["get"] = "get";
    route_methods["post"] = "post";
    route_methods["put"] = "put";
    route_methods["delete"] = "delete";
})(route_methods || (route_methods = {}));
var route_types;
(function (route_types) {
    route_types["endpt"] = "endpt";
    route_types["mdlwr"] = "mdlwr";
})(route_types || (route_types = {}));
export default class Router {
    constructor() {
        this.routes = [];
    }
    addMdlwr(method, path, options, ...cb) {
        let keys = [];
        let parse = pathToRegexp(path, keys, options);
        let methods = Array.isArray(method) ? method : [method];
        this.routes.push({
            method: method ? methods : null,
            path,
            regex: parse,
            keys,
            cb,
            type: route_types.mdlwr
        });
    }
    addRoute(method, path, options, ...cb) {
        let keys = [];
        let parse = pathToRegexp(path, keys, options);
        let methods = Array.isArray(method) ? method : [method];
        this.routes.push({
            method: method ? methods : null,
            path,
            regex: parse,
            keys,
            cb,
            type: route_types.endpt
        });
    }
    mapRegexToObject(regex_result, keys) {
        let rtn = {};
        for (let i = 1, len = regex_result.length; i < len; ++i) {
            rtn[keys[i - 1].name] = typeof regex_result[i] === 'undefined' ? '' : regex_result[i];
        }
        return rtn;
    }
    async runRoute(route_cbs, request, response) {
        for (let cb of route_cbs) {
            let result = await cb(request, response);
            if (typeof result === 'boolean') {
                if (result)
                    return true;
            }
        }
        return;
    }
    async run(request, response) {
        let path = request.url;
        let authority = request.headers[':authority'] || request.headers['host'];
        let scheme = request.headers[':scheme'] || 'encrypted' in request.socket ? 'https' : 'http';
        let version = request.httpVersion;
        let method = request.method.toLowerCase();
        let req_url = new URL(path, `${scheme}://${authority}`);
        request['parsed_url'] = req_url;
        for (let route of this.routes) {
            let regex_result = route.regex.exec(req_url.pathname);
            this.current_route = route;
            if (regex_result !== null) {
                request['params'] = this.mapRegexToObject(regex_result, route.keys);
                let result;
                if (route.method) {
                    // @ts-ignore
                    if (route.method.includes(method)) {
                        result = await this.runRoute(route.cb, request, response);
                        if (route.type === route_types.endpt) {
                            return {
                                found: true,
                                valid_method: true
                            };
                        }
                    }
                    else {
                        if (route.type === route_types.endpt) {
                            return {
                                found: true,
                                valid_method: false
                            };
                        }
                    }
                }
                else {
                    result = await this.runRoute(route.cb, request, response);
                    if (route.type === route_types.endpt) {
                        return {
                            found: true,
                            valid_method: true
                        };
                    }
                }
                if (typeof result === 'boolean') {
                    if (result)
                        return {
                            found: true,
                            valid_method: true
                        };
                }
            }
        }
        return {
            found: false,
            valid_method: false
        };
    }
}
