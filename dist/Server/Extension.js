import { readdirStats } from "../io/file/file_sys";
import { basename, join } from "path";
export default class Extension {
    static async loadDirectory(server, path) {
        let directory_contents = await readdirStats(path);
        let load_order = [];
        let load_order_check = [];
        let instances = [];
        console.log("loading extension directory:", path);
        for (let item_stats of directory_contents) {
            if (basename(item_stats.name, ".js") === "load_order") {
                let order = await import(join(path, item_stats.name));
                let mod = order.default;
                load_order_check = typeof mod === "function" ? mod(server) : mod;
            }
        }
        if (load_order_check.length !== 0) {
            for (let item of load_order_check) {
                let found = directory_contents.find(item_stats => item === basename(item_stats.name, ".js"));
                if (found) {
                    load_order.push(found);
                }
                else {
                    console.warn("did not find module specified in load order:", item);
                }
            }
        }
        else {
            load_order = directory_contents;
        }
        console.log("attempting to load extensions:", load_order.map(item_stats => item_stats.name));
        for (let item_stats of load_order) {
            let mod = null;
            if (item_stats.isDirectory()) {
                mod = await import(join(path, item_stats.name, "main.js"));
            }
            else {
                mod = await import(join(path, item_stats.name));
            }
            let instance = new mod.default(server);
            if (instance instanceof Extension) {
                await instance.load();
            }
            else {
                throw new Error("invalid_class");
            }
        }
        return instances;
    }
    constructor(server) {
        this.server = server;
    }
}
