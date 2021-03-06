import Server from "./Server";
import { readdirStats, stat_extend } from "../io/file/file_sys";
import { basename, join } from "path";

export default abstract class Extension {

    protected server: Server;

    public abstract requires: string[];
    
    static async loadDirectory(server: Server, path: string): Promise<Array<Extension>> {
        let directory_contents = await readdirStats(path);
        let load_order: stat_extend[] = [];
        let load_order_check: string[] = [];
        let instances: Extension[] = [];

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
                } else {
                    console.warn("did not find module specified in load order:", item);
                }
            }
        } else {
            load_order = directory_contents;
        }

        console.log("attempting to load extensions:", load_order.map(item_stats => item_stats.name));

        for (let item_stats of load_order) {
            let mod = null;

            if (item_stats.isDirectory()) {
                mod = await import(join(path, item_stats.name, "main.js"));
            } else {
                mod = await import(join(path, item_stats.name));
            }

            let instance: Extension = new mod.default(server);

            if (instance instanceof Extension) {
                await instance.load();
            } else {
                throw new Error("invalid_class");
            }
        }

        return instances;
    }

    constructor(server: Server) {
        this.server = server;
    }

    public abstract getName(): string;

    public abstract async load(): Promise<void>;

}