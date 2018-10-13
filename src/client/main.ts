import SocketClient from "../Sockets/SocketClient";

const main = async () => {
    let str: string = "hello";

    console.log("running",str);

    let soc = new SocketClient("wss://localhost:8443");
}

main().catch(err => console.error(err));