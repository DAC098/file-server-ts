// @ts-ignore
import pathToRegexp from 'path-to-regexp';
export var route_methods;
(function (route_methods) {
    route_methods["get"] = "get";
    route_methods["post"] = "post";
    route_methods["put"] = "put";
    route_methods["delete"] = "delete";
})(route_methods || (route_methods = {}));
export default class Router {
    constructor() {
        this.routes = [];
    }
    addRoute(method, path, options, ...cb) {
        let keys = [];
        let parse = pathToRegexp(path, keys, options);
        this.routes.push({
            method,
            path,
            regex: parse,
            keys,
            cb
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
        console.log(`${request.method} ${request.url} HTTP/${version}${scheme === 'https' ? ' SSL' : ''}`);
        let req_url = new URL(path, `${scheme}://${authority}`);
        request['parsed_url'] = req_url;
        for (let route of this.routes) {
            let regex_result = route.regex.exec(req_url.pathname);
            if (regex_result !== null) {
                request['params'] = this.mapRegexToObject(regex_result, route.keys);
                let result;
                if (route.method !== null) {
                    if (route.method === method) {
                        result = await this.runRoute(route.cb, request, response);
                    }
                }
                else {
                    result = await this.runRoute(route.cb, request, response);
                }
                if (typeof result === 'boolean') {
                    if (result)
                        return true;
                }
            }
        }
    }
}
