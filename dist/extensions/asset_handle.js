import Extension from "../Server/Extension";
import { createReadStream } from "fs";
import { exists } from "../io/file/file_sys";
import pp from '../pp';
import { route_methods } from "../Routing/Router";
import { join } from "path";
export default class asset_handle extends Extension {
    getName() {
        return "asset_handle";
    }
    async handle_asset_request(request, response) {
        let check_path = join(process.cwd(), '/assets/' + request.params['path']);
        if (await exists(check_path)) {
            let read_stream = createReadStream(check_path);
            await pp(read_stream, response);
            read_stream.close();
            response.end();
        }
        else {
            response.writeHead(404, { 'content-type': 'text/plain' });
            response.end('not found');
        }
    }
    async load(server) {
        server.router.addRoute(route_methods.get, '/assets/:path*', {}, (...args) => this.handle_asset_request(...args));
    }
}
