import renderContents from "./renderContents";
import { Stats } from "fs";
import renderDirPath from "./renderDirPath";

const renderFile = async (path: string, full_path: string, stats: Stats, data: Buffer): Promise<string> => {
    let str: string = `
    <div>directory: ${renderDirPath(path)}</div>
    <div>path: ${path}</div>
    <div><a href='/fs${path}?download=1' download>Download</a></div>
    <div>contents:</div>
    <pre>${data}</pre>
    `;

    return renderContents(path, str);
}

export default renderFile;