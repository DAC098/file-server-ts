import Server from "./Server/Server";
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
    await server.start();
    try {
        await server.loadExtensions();
    }
    catch (err) {
        console.error("error loading extensions:", err.stack);
    }
    console.log(server.address());
    console.log(process.pid);
}
main().catch(err => {
    console.log(err);
});
