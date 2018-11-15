import { route_params } from "./Router";
// @ts-ignore
import pathToRegexp, { Key, RegExpOptions } from "path-to-regexp";
import { server_request, server_response } from "../Server/Server";

export enum handle_result {
    unhandled = 0,
    handled = 1,
    continue = 2
};

export default abstract class AbstractHandle {
    protected abstract path: string = "";
    protected abstract path_options: RegExpOptions = {};

    private regex: RegExp;
    private keys: Key[] = [];
    private regex_created: boolean = false;

    private static getRegexpMapping(regex_result: RegExpExecArray, keys: Key[]): route_params {
        let rtn = {};

        for (let i = 1, l = regex_result.length; i < l; ++i) {
            rtn[keys[i - 1].name] = typeof regex_result[i] === "undefined" ? null : regex_result[i];
        }

        return rtn;
    }

    constructor() {}

    public processRegex(): void {
        this.regex = pathToRegexp(this.path, this.keys, this.path_options);
        this.regex_created = true;
    }

    public regexCreated(): boolean {
        return this.regex_created;
    }

    public execPath(path_given: string): RegExpExecArray {
        return this.regex.exec(path_given);
    }

    public getParams(regex_result: RegExpExecArray): route_params {
        return AbstractHandle.getRegexpMapping(regex_result, this.keys);
    }

    public getPath(): string {
        return this.path;
    }

    public abstract async handleHead(request: server_request, response: server_response): Promise<handle_result>;
    public abstract async handleGet(request: server_request, response: server_response): Promise<handle_result>;
    public abstract async handlePost(request: server_request, response: server_response): Promise<handle_result>;
    public abstract async handlePut(request: server_request, response: server_response): Promise<handle_result>;
    public abstract async handleDelete(request: server_request, response: server_response): Promise<handle_result>;
}