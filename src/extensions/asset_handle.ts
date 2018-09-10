import Extension from "../Server/Extension";
import Server from "../Server/Server";

import { createReadStream, Stats } from "fs";
import { Http2ServerResponse } from "http2";

import { exists } from "../io/file/file_sys";
import pp from '../pp';
import {route_methods, route_request} from "../Routing/Router";

export default class asset_handle extends Extension {
    getName(): string {
        return "asset_handle";
    }

    async handle_asset_request(request: route_request, response: Http2ServerResponse): Promise<void> {
        if(await exists('/' + request.params['path'])) {
            let read_stream = createReadStream('/' + request.params['path']);

            await pp(read_stream,response);

            read_stream.close();
            response.end();
        } else {
            response.writeHead(404,{'content-type':'text/plain'});
            response.end('not found');
        }
    }

    async load(server: Server): Promise<void> {
        server.router.addRoute(
            route_methods.get,
            '/asset/:path*',
            {},
           (...args) => this.handle_asset_request(...args)
        );
    }
}