import Handle from "../../Routing/Handle";
import { server_request, server_response } from "../../Server/Server";
import { handle_result } from "../../Routing/AbstractHandle";
import { createReadStream } from "fs";
import { exists } from "../../io/file/file_sys";
import pp from '../../pp';
import { join } from "path";

export default class handle_asset extends Handle {
    protected path = "/assets/*";
    protected path_options = {};

    public async handleGet(request: server_request, response: server_response): Promise<handle_result> {
        let check_path = join(process.cwd(),'/assets/' + request.params['path']);
        
        if(await exists(check_path)) {
            let read_stream = createReadStream(check_path);

            await pp(read_stream, response);

            read_stream.close();
            response.end();
        } else {
            response.writeHead(404,{'content-type':'text/plain'});
            response.end('not found');
        }

        return handle_result.handled;
    }
}