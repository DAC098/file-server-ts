import Extension from "../../Server/Extension";
import handle_file_dir from "./handle_file_dir";
import handle_root_redirect from "./handle_root_redirect";

export default class File extends Extension {
    requires = ["core"];

    getName(): string {
        return "file";
    }

    async load(): Promise<void> {
        let h_file_dir = new handle_file_dir();
        let h_root_redirect = new handle_root_redirect();

        this.server.router.addHandle(h_root_redirect);
        this.server.router.addHandle(h_file_dir);
    }
}