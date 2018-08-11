import Server from "./Server/Server";
import handle from "./handle";
async function main() {
    let options = {
        host: '0.0.0.0',
        port: 443,
        backlog: 500,
        alpn: true,
        tls: {
            cert_path: '',
            key_path: ''
        }
    };
    let server = new Server();
    await server.createServerOptions(options);
    server.setHandle(handle);
    await server.start();
    console.log(server.address());
}
main().catch(err => {
    console.log(err);
});
