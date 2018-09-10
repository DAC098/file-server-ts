import Server, {server_options} from "./Server/Server";

async function main(): Promise<void> {
    let options: server_options = {
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
    } catch(err) {
        console.error("error loading extensions:",err.stack);
    }

    console.log(server.address());
}

main().catch(err => {
    console.log(err);
});