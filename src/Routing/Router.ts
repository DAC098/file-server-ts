import { RegExpOptions } from "path-to-regexp";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import Route from "./Route";



export enum route_methods {
    get = "get",
    post = "post",
    put = "put",
    delete = "delete"
}

export enum route_types {
    endpt = "endpt",
    mdlwr = "mdlwr"
}

export type route_params = {
    [s: string]: string | null
}

export interface route_request extends Http2ServerRequest, ReadableStream {
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

export type route_method_like = route_methods | route_methods[] | null | undefined

export default class Router {
    private routes: Route[];
    private current_extension: string;

    public current_route: Route;

    constructor() {
        this.routes = [];
    }

    setCurrentExtension(extension: string): void {
        this.current_extension = extension;
    }

    addMdlwr(
        method: route_method_like,
        path: string,
        options: RegExpOptions,
        ...cb: route_cb[]
    ): void {
        let new_route = new Route(
            this.current_extension,
            route_types.mdlwr,
            method,
            path,
            options,
            cb
        );

        this.routes.push(new_route);
    }
    
    addRoute(
        method: route_method_like, 
        path: string, 
        options: RegExpOptions, 
        ...cb: route_cb[]
    ): void {
        let new_route = new Route(
            this.current_extension,
            route_types.endpt,
            method,
            path,
            options,
            cb
        );

        this.routes.push(new_route);
    }

    async runRoute(route_cbs: route_cb[],request: route_request, response: Http2ServerResponse): Promise<void | boolean> {
        for(let cb of route_cbs) {
            let result = await cb(request,response);

            if(typeof result === "boolean") {
                if(result)
                    return true;
            }
        }

        return;
    }

    async run(request: Http2ServerRequest, response: Http2ServerResponse): Promise<boolean>;
    async run(request: Http2ServerRequest & route_request, response: Http2ServerResponse): Promise<boolean> {
        let path = request.url;
        let authority = request.headers[":authority"] || request.headers["host"];
        let scheme = request.headers[":scheme"] || "encrypted" in request.socket ? "https" : "http";
        let version = request.httpVersion;
        let method = <route_methods>request.method.toLowerCase();

        let req_url = new URL(path,`${scheme}://${authority}`);

        request["parsed_url"] = req_url;

        for(let route of this.routes) {
            let regex_result = route.execPath(req_url.pathname);

            this.current_route = route;
            
            if(regex_result !== null) {
                request["params"] = Route.getRegexpMapping(regex_result,route.keys);
                let result;
                let check_method = false;
                let ran_method = false;

                if(route.hasMethods()) {
                    check_method = true;
                    
                    if(route.checkMethod(method)) {
                        ran_method = true;
                        result = await route.run(request,response);
                    }
                } else {
                    result = await route.run(request,response);
                }

                switch(route.type) {
                    case route_types.endpt:
                        if(typeof result === "boolean") {
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
                        if(typeof result === "boolean") {
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