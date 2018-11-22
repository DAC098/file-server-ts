import Extension from "../../Server/Extension";
import handle_asset from "./handle_asset";

export default class Core extends Extension {
    requires = [];

    getName() {
        return "core";
    }

    async load() {
        let h_assets = new handle_asset();
    }
}