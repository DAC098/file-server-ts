// @ts-ignore
import pathToRegexp, {RegExpOptions, Key} from 'path-to-regexp';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';

export enum route_methods {
    get = "get",
    post = "post",
    put = "put",
    delete = "delete"
}

enum route_types {
    endpt = "endpt",
    mdlwr = "mdlwr"
}

type route_params = {
    [s: string]: string
}

export interface route_request extends Http2ServerRequest {
    params: route_params,
    parsed_url: URL
}

export interface route_cb {
    (request: route_request,response: Http2ServerResponse): Promise<void | boolean>
}

export interface route_run_result {
    found: boolean,
    valid_method: boolean
}

interface route_data {
    method: route_methods[] | null,
    path: string,
    regex: RegExp,
    keys: Key[],
    cb: route_cb[],
    type: route_types
}

export default class Router {
    private routes: route_data[];
    public current_route: route_data;

    constructor() {
        this.routes = [];
    }

    addMdlwr(
        method: route_methods | route_methods | null | undefined,
        path: string,
        options: RegExpOptions,
        ...cb: route_cb[]
    ): void {
        let keys: Key[] = [];
        let parse: RegExp = pathToRegexp(path,keys,options);
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
    
    addRoute(
        method: route_methods | route_methods[] | null | undefined, 
        path: string, 
        options: RegExpOptions, 
        ...cb: route_cb[]
    ): void {
        let keys: Key[] = [];
        let parse: RegExp = pathToRegexp(path,keys,options);
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

    mapRegexToObject(regex_result: RegExpExecArray, keys: Key[]): route_params {
        let rtn = {};

        for(let i = 1,len = regex_result.length; i < len; ++i) {
            rtn[keys[i - 1].name] = typeof regex_result[i] === 'undefined' ? '' : regex_result[i];
        }

        return rtn;
    }

    async runRoute(route_cbs: route_cb[],request: route_request, response: Http2ServerResponse): Promise<void | boolean> {
        for(let cb of route_cbs) {
            let result = await cb(request,response);

            if(typeof result === 'boolean') {
                if(result)
                    return true;
            }
        }

        return;
    }

    async run(request: Http2ServerRequest, response: Http2ServerResponse): Promise<boolean>;
    async run(request: Http2ServerRequest & route_request, response: Http2ServerResponse): Promise<boolean> {
        let path = request.url;
        let authority = request.headers[':authority'] || request.headers['host'];
        let scheme = request.headers[':scheme'] || 'encrypted' in request.socket ? 'https' : 'http';
        let version = request.httpVersion;
        let method = request.method.toLowerCase();

        let req_url = new URL(path,`${scheme}://${authority}`);

        request['parsed_url'] = req_url;

        for(let route of this.routes) {
            let regex_result = route.regex.exec(req_url.pathname);

            this.current_route = route;
            
            if(regex_result !== null) {
                request['params'] = this.mapRegexToObject(regex_result,route.keys);
                let result;
                let check_method = false;
                let ran_method = false;

                if(route.method) {
                    check_method = true;
                    // @ts-ignore
                    if(route.method.includes(method)) {
                        ran_method = true;
                        result = await this.runRoute(route.cb,request,response);
                    }
                } else {
                    result = await this.runRoute(route.cb,request,response);
                }

                switch(route.type) {
                    case route_types.endpt:
                        if(typeof result === 'boolean') {
                            if(check_method) {
                                if(ran_method && !result)
                                    return true;
                            } else {
                                if(!result)
                                    return true;
                            }
                        } else {
                            if(check_method) {
                                if(ran_method)
                                    return true;
                            } else {
                                return true;
                            }
                        }
                        break;
                    case route_types.mdlwr:
                        if(typeof result === 'boolean') {
                            if(result)
                                return true;
                        }
                    break;
                }
            }
        }

        return false;
    }
}