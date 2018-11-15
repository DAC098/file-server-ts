import Extension from "../../Server/Extension";
import handle_asset from "./handle_asset";
export default class asset_handle extends Extension {
    getName() {
        return "asset_handle";
    }
    async load() {
        let h_asset = new handle_asset();
        this.server.router.addHandle(h_asset);
    }
}
