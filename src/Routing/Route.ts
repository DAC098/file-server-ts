import {
    route_methods, 
    route_cb, 
    route_types, 
    route_request, 
    route_method_like, 
    route_params
} from "./Router";
// @ts-ignore
import pathToRegexp, { Key, RegExpOptions } from "path-to-regexp";
import { Http2ServerResponse } from "http2";


export default class Route {
    private _path: string;
    private _regex: RegExp;
    private _method: route_methods[] | null;
    private _keys: Key[];
    private _cb: route_cb[];
    private _type: route_types;
    private _enabled: boolean;
    private _extension: string;

    static getRegexpMapping(regex_result: RegExpExecArray, keys: Key[]): route_params {
        let rtn = {};

        for (let i = 1,l = regex_result.length; i < l; ++i) {
            rtn[keys[i - 1].name] = typeof regex_result[i] === "undefined" ? null : regex_result[i];
        }

        return rtn;
    }

    constructor(
        extension: string,
        type: route_types, 
        method: route_method_like, 
        path: string, 
        options: RegExpOptions, 
        cb: route_cb[]
    ) {
        let keys: Key[] = [];
        let parse: RegExp = pathToRegexp(path, keys, options);
        let methods = Array.isArray(method) ? method : [method];

        this._path = path;
        this._type = type;
        this._method = method ? methods : null;
        this._keys = keys;
        this._regex = parse;
        this._cb = cb;
        this._extension = extension;
        this._enabled = true;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        if (typeof value !== "boolean")
            throw new TypeError("invalid type given, requires boolean");

        this._enabled = value;
    }

    get path(): string {
        return this._path;
    }

    get type(): route_types {
        return this._type;
    }

    get extension(): string {
        return this._extension;
    }

    get keys(): Key[] {
        return this._keys;
    }

    execPath(path_given: string): RegExpExecArray {
        // console.log("checking:",path_given,"against route:",this,"reg:",this._regex);
        return this._regex.exec(path_given);
    }

    hasMethods(): boolean {
        // console.log("checking if route:",this," has methods",this._method !== null);
        return this._method !== null;
    }

    checkMethod(method_given: route_methods): boolean {
        return this._method.includes(method_given);
    }

    async run(request: route_request, response: Http2ServerResponse): Promise<void | boolean> {
        // console.log("running route:",this);
        for(let cb of this._cb) {
            let result = await cb(request,response);

            if(typeof result === "boolean") {
                if(result)
                    return true;
            }
        }

        return;
    }

    [Symbol.toString()](): string {
        return this._path;
    }
}