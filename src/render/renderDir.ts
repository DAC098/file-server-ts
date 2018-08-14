import renderContents from "./renderContents";
import { dirname, basename, join } from "path";
import { stat_extend } from "../io/file/file_sys";
import renderDirPath from "./renderDirPath";

const renderDir = async (path: string, full_path: string, files: stat_extend[]): Promise<string> => {
    let parent_dir = path !== '/' ? dirname(path) : '/';
    let retrieve = [
        {
            name: 'Size',
            key: 'size'
        }
    ];
    let rows = [];

    for(let file of files) {
        let data = [
            `<a href='/fs${join(path,file.name)}'>${basename(file.name)}</a>`
        ];

        if(file.isFile()) {
            data.push('file');
        } else {
            data.push('dir');
        }

        for(let get of retrieve) {
            data.push(file[get.key]);
        }

        rows.push(`<tr><td>${data.join('</td><td>')}</td></tr>`);
    }

    let header_rows = [];

    for(let header of retrieve) {
        header_rows.push(`<th>${header.name}</th>`);
    }

    let str: string = `
    <div>parent: ${renderDirPath(path)}</div>
    <div>path: ${path}</div>
    <div><a href='/fs${path}?download=1' download>Download</a></div>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Type</th>
                ${header_rows.join('\n')}
            </tr>
        </thead>
        <tbody>
            ${rows.join('\n')}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="${2 + retrieve.length}">total: ${files.length}</td>
            </tr>
        </tfoot>
    </table>
    `;
    return renderContents(path,str);
}

export default renderDir;