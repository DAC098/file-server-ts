import Server from "../Server/Server";

export default function load(server: Server): Array<string> {
    return [
        // "socket_handle",
        "assets",
        // "session_handle",
        "file"
    ];
};