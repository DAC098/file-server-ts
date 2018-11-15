import Extension from "../../Server/Extension";
import Server from "../../Server/Server";
import handle_asset from "./handle_asset";

export default class asset_handle extends Extension {
    getName(): string {
        return "asset_handle";
    }

    async load(): Promise<void> {
        let h_asset = new handle_asset();

        this.server.router.addHandle(h_asset);
    }
}