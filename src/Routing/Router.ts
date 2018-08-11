// @ts-ignore
import pathToRegexp, {RegExpOptions, Key} from 'path-to-regexp';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';

export enum route_methods {
    get = "get",
    post = "post",
    put = "put",
    delete = "delete"
}

interface route_params {
    [s: string]: string
}

export interface route_request extends Http2ServerRequest {
    params: route_params,
    parsed_url: URL
}

export interface route_cb {
    (request: route_request,response: Http2ServerResponse): Promise<void | boolean>
}

interface route_data {
    method: route_methods | null,
    path: string,
    regex: RegExp,
    keys: Key[],
    cb: route_cb[]
}

export default class Router {
    private routes: route_data[];

    constructor() {
        this.routes = [];
    }

    addRoute(method: route_methods | null, path: string, options: RegExpOptions, ...cb: route_cb[]): void {
        let keys: Key[] = [];
        let parse: RegExp = pathToRegexp(path,keys,options);

        this.routes.push({
            method,
            path,
            regex: parse,
            keys,
            cb
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

    async run(request: Http2ServerRequest, response: Http2ServerResponse): Promise<void|boolean>;
    async run(request: Http2ServerRequest & route_request, response: Http2ServerResponse): Promise<void|boolean> {
        let path = request.url;
        let authority = request.headers[':authority'] || request.headers['host'];
        let scheme = request.headers[':scheme'] || 'encrypted' in request.socket ? 'https' : 'http';
        let version = request.httpVersion;
        let method = request.method.toLowerCase();

        console.log(`${request.method} ${request.url} HTTP/${version}${scheme === 'https' ? ' SSL' : ''}`);

        let req_url = new URL(path,`${scheme}://${authority}`);

        request['parsed_url'] = req_url;

        for(let route of this.routes) {
            let regex_result = route.regex.exec(req_url.pathname);
            
            if(regex_result !== null) {
                request['params'] = this.mapRegexToObject(regex_result,route.keys);
                let result;

                if(route.method !== null) {
                    if(route.method === method) {
                        result = await this.runRoute(route.cb,request,response);
                    }
                } else {
                    result = await this.runRoute(route.cb,request,response);
                }

                if(typeof result === 'boolean') {
                    if(result)
                        return true;
                }
            }
        }
    }
}