import Server from "./Server";

export default abstract class Extension {
    
    abstract getName(): string;

    abstract async load(server: Server): Promise<void>;

}