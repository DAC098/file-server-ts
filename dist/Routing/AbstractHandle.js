// @ts-ignore
import pathToRegexp from "path-to-regexp";
export var handle_result;
(function (handle_result) {
    handle_result[handle_result["unhandled"] = 0] = "unhandled";
    handle_result[handle_result["handled"] = 1] = "handled";
    handle_result[handle_result["continue"] = 2] = "continue";
})(handle_result || (handle_result = {}));
;
export default class AbstractHandle {
    constructor() {
        this.path = "";
        this.path_options = {};
        this.keys = [];
        this.regex_created = false;
    }
    static getRegexpMapping(regex_result, keys) {
        let rtn = {};
        for (let i = 1, l = regex_result.length; i < l; ++i) {
            rtn[keys[i - 1].name] = typeof regex_result[i] === "undefined" ? null : regex_result[i];
        }
        return rtn;
    }
    processRegex() {
        this.regex = pathToRegexp(this.path, this.keys, this.path_options);
        this.regex_created = true;
    }
    regexCreated() {
        return this.regex_created;
    }
    execPath(path_given) {
        return this.regex.exec(path_given);
    }
    getParams(regex_result) {
        return AbstractHandle.getRegexpMapping(regex_result, this.keys);
    }
    getPath() {
        return this.path;
    }
}
