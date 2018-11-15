import AbstractHandle, { handle_result } from "./AbstractHandle";
import { server_request, server_response } from "../Server/Server";

export default abstract class Middleware extends AbstractHandle {
    public async handleHead(request: server_request, response: server_response): Promise<handle_result> {
        return handle_result.continue;
    }

    public async handleGet(request: server_request, response: server_response): Promise<handle_result> {
        return handle_result.continue;
    }

    public async handlePost(request: server_request, response: server_response): Promise<handle_result> {
        return handle_result.continue;
    }

    public async handlePut(request: server_request, response: server_response): Promise<handle_result> {
        return handle_result.continue;
    }

    public async handleDelete(request: server_request, response: server_response): Promise<handle_result> {
        return handle_result.continue;
    }
}