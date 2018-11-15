import AbstractHandle, { handle_result } from "./AbstractHandle";
export default class Middleware extends AbstractHandle {
    async handleHead(request, response) {
        return handle_result.continue;
    }
    async handleGet(request, response) {
        return handle_result.continue;
    }
    async handlePost(request, response) {
        return handle_result.continue;
    }
    async handlePut(request, response) {
        return handle_result.continue;
    }
    async handleDelete(request, response) {
        return handle_result.continue;
    }
}
