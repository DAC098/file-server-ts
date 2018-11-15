import AbstractHandle, { handle_result } from "./AbstractHandle";
import { server_request, server_response } from "../Server/Server";

export default abstract class Handle extends AbstractHandle {
    public async handleHead(request: server_request, response: server_response): Promise<handle_result> {
        return handle_result.unhandled;
    }

    public async handleGet(request: server_request, response: server_response): Promise<handle_result> {
        return handle_result.unhandled;
    }

    public async handlePost(request: server_request, response: server_response): Promise<handle_result> {
        return handle_result.unhandled;
    }

    public async handlePut(request: server_request, response: server_response): Promise<handle_result> {
        return handle_result.unhandled;
    }

    public async handleDelete(request: server_request, response: server_response): Promise<handle_result> {
        return handle_result.unhandled;
    }
}