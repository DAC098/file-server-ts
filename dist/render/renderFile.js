import renderContents from "./renderContents";
import renderDirPath from "./renderDirPath";
const renderFile = async (path, full_path, stats, data) => {
    let str = `
    <div>directory: ${renderDirPath(path)}</div>
    <div>path: ${path}</div>
    <div><a href='/fs${path}?download=1' download>Download</a></div>
    <div>contents:</div>
    <pre>${data}</pre>
    `;
    return renderContents(path, str);
};
export default renderFile;
