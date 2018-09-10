import Extension from "../Server/Extension";
export default class session_handle extends Extension {
    getName() {
        return "session_handle";
    }
    async handle_session_request(request, response) {
        console.log('running session info to see if user is logged in');
    }
    async load(server) {
        server.router.addMdlwr(null, '/', { end: false }, (...args) => this.handle_session_request(...args));
    }
}
