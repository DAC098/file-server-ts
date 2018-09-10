import Extension from "../Server/Extension";
import Server from "../Server/Server";

import { Http2ServerResponse } from "http2";
import { route_request } from "../Routing/Router";

export default class session_handle extends Extension {
    getName(): string {
        return "session_handle";
    }

    async handle_session_request(request: route_request, response: Http2ServerResponse): Promise<boolean|void> {
        console.log('running session info to see if user is logged in');
    }

    async load(server: Server): Promise<void> {
        server.router.addMdlwr(
            null,
            '/',
            {end: false},
            (...args) => this.handle_session_request(...args)
        );
    }
}