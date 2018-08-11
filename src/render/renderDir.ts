import renderContents from "./renderContents";
import { dirname, basename, join } from "path";
import { readdir, exists, stat } from "../file_sys";
import { Stats } from "fs";

const renderDir = async (path: string, full_path: string): Promise<string> => {
    let parent_dir = path !== '/' ? dirname(path) : '/';
    let files = await readdir(full_path);
    let retrieve = [
        {
            name: 'Size',
            key: 'size'
        }
    ];
    let rows = [];

    for(let file of files) {
        try {
            let stats = await stat(join(full_path,file));
            let data = [
                `<a href='/fs${join(path,file)}'>${basename(file)}</a>`
            ];

            if(stats.isFile()) {
                data.push('file');
            } else {
                data.push('dir');
            }

            for(let get of retrieve) {
                data.push(stats[get.key]);
            }

            rows.push(`<tr><td>${data.join('</td><td>')}</td></tr>`);
        } catch(err) {
            console.error(err);
        }
    }

    let header_rows = [];

    for(let header of retrieve) {
        header_rows.push(`<th>${header.name}</th>`);
    }

    let str: string = `
    <div>parent: <a href='/fs${parent_dir}'>${parent_dir}</a></div>
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