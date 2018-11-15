import AbstractHandle, { handle_result } from "./AbstractHandle";
export default class Handle extends AbstractHandle {
    async handleHead(request, response) {
        return handle_result.unhandled;
    }
    async handleGet(request, response) {
        return handle_result.unhandled;
    }
    async handlePost(request, response) {
        return handle_result.unhandled;
    }
    async handlePut(request, response) {
        return handle_result.unhandled;
    }
    async handleDelete(request, response) {
        return handle_result.unhandled;
    }
}
