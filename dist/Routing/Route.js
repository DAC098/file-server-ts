// @ts-ignore
import pathToRegexp from "path-to-regexp";
export default class Route {
    static getRegexpMapping(regex_result, keys) {
        let rtn = {};
        for (let i = 1, l = regex_result.length; i < l; ++i) {
            rtn[keys[i - 1].name] = typeof regex_result[i] === "undefined" ? null : regex_result[i];
        }
        return rtn;
    }
    constructor(extension, type, method, path, options, cb) {
        let keys = [];
        let parse = pathToRegexp(path, keys, options);
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
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        if (typeof value !== "boolean")
            throw new TypeError("invalid type given, requires boolean");
        this._enabled = value;
    }
    get path() {
        return this._path;
    }
    get type() {
        return this._type;
    }
    get extension() {
        return this._extension;
    }
    get keys() {
        return this._keys;
    }
    execPath(path_given) {
        // console.log("checking:",path_given,"against route:",this,"reg:",this._regex);
        return this._regex.exec(path_given);
    }
    hasMethods() {
        // console.log("checking if route:",this," has methods",this._method !== null);
        return this._method !== null;
    }
    checkMethod(method_given) {
        return this._method.includes(method_given);
    }
    async run(request, response) {
        // console.log("running route:",this);
        for (let cb of this._cb) {
            let result = await cb(request, response);
            if (typeof result === "boolean") {
                if (result)
                    return true;
            }
        }
        return;
    }
    [Symbol.toString()]() {
        return this._path;
    }
}
