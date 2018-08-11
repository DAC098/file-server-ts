import renderContents from "./renderContents";
import { dirname } from "path";
import { readFile } from "../file_sys";
const renderFile = async (path, full_path) => {
    let data = await readFile(full_path);
    let str = `
    <div>directory: <a href='${dirname(path)}'>${dirname(path)}</a></div>
    <div>path: ${path}</div>
    <div><a href='${path}?download=1' download>Download</a></div>
    <div>contents:</div>
    <pre>${data}</pre>
    `;
    return renderContents(path, str);
};
export default renderFile;
