import Extension from "../Server/Extension";
import { route_methods } from "../Routing/Router";
import { join, basename, dirname } from "path";
import { exists, unlink, stat, readdirStats, readFile, mkdir, rmdirRec } from "../io/file/file_sys";
import renderDir from "../render/renderDir";
import renderFile from "../render/renderFile";
import pp from '../pp';
import { createReadStream } from "fs";
// @ts-ignore
import tar from 'tar';
import uploadFile from "../io/file/uploadFile";
export default class file_handles extends Extension {
    constructor() {
        super(...arguments);
        this.search_path = "/";
    }
    getName() {
        return "file_handles";
    }
    async handle_root_redirect(request, response) {
        if ('accept' in request.headers && request.headers['accept'].includes('text/html')) {
            response.writeHead(302, { 'location': '/fs' });
            response.end();
            return true;
        }
    }
    async handle_post_file(request, response) {
        let path = '/' + request.params['path'];
        let full_path = join(this.search_path, path);
        let stats = null;
        let file_name = request.parsed_url.searchParams.get('file_name');
        let upload_opt = request.parsed_url.searchParams.get('upload');
        let use_parent = false;
        let initial_found = false;
        console.log('file_name:', file_name);
        console.log('upload_opt:', upload_opt);
        try {
            stats = await stat(full_path);
            initial_found = true;
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                console.error(err);
                response.writeHead(500, { 'content-type': 'text/plain' });
                response.end(`server error: ${err.stack}`);
                return;
            }
            use_parent = true;
        }
        if (!initial_found) {
            if (upload_opt) {
                console.log("checking if parent location exists");
                try {
                    stats = await stat(dirname(full_path));
                }
                catch (err) {
                    if (err.code !== 'ENOENT') {
                        console.error(err);
                        response.writeHead(500, { 'content-type': 'text/plain' });
                        response.end(`server error: ${err.stack}`);
                    }
                    else {
                        response.writeHead(404, { 'content-type': 'text/plain' });
                        response.end(`not found`);
                    }
                    return;
                }
            }
            else {
                console.log('did not find location, use_parent:', use_parent, 'upload_opt:', upload_opt);
                response.writeHead(404, { 'content-type': 'text/plain' });
                response.end(`not found`);
                return;
            }
        }
        if (upload_opt) {
            switch (upload_opt) {
                case 'file':
                    if (stats.isFile()) {
                        // overwrite existing file
                        try {
                            await uploadFile(full_path, request, {
                                unpack: request.parsed_url.searchParams.has('unpack'),
                                delete_unpack: request.parsed_url.searchParams.has('delete_unpack'),
                                overwrite: request.parsed_url.searchParams.has('overwrite')
                            });
                        }
                        catch (err) {
                            response.writeHead(500, { 'content-type': 'text/plain' });
                            response.end(`server error: ${err.stack}`);
                            return;
                        }
                    }
                    if (stats.isDirectory()) {
                        if (use_parent) {
                            // create file with basename of url
                            try {
                                await uploadFile(full_path, request, {
                                    unpack: request.parsed_url.searchParams.has('unpack'),
                                    delete_unpack: request.parsed_url.searchParams.has('delete_unpack'),
                                    overwrite: true
                                });
                            }
                            catch (err) {
                                response.writeHead(500, { 'content-type': 'text/plain' });
                                response.end(`server error: ${err.stack}`);
                                return;
                            }
                        }
                        else {
                            if (!file_name) {
                                response.writeHead(405, { 'content-type': 'text/plain' });
                                response.end(`a file_name is required to upload a file`);
                                return;
                            }
                            try {
                                await uploadFile(join(full_path, file_name), request, {
                                    unpack: request.parsed_url.searchParams.has('unpack'),
                                    delete_unpack: request.parsed_url.searchParams.has('delete_unpack'),
                                    overwrite: request.parsed_url.searchParams.has('overwrite')
                                });
                            }
                            catch (err) {
                                response.writeHead(500, { 'content-type': 'text/plain' });
                                response.end(`server error: ${err.stack}`);
                                return;
                            }
                        }
                    }
                    break;
                case 'dir':
                    if (stats.isFile()) {
                        response.writeHead(405, { 'content-type': 'text/plain' });
                        response.end(`will not overwrite a file with a directory`);
                        return;
                    }
                    if (stats.isDirectory()) {
                        if (use_parent) {
                            // create directory with basename of url
                            try {
                                await mkdir(full_path);
                            }
                            catch (err) {
                                response.writeHead(500, { 'content-type': 'text/plain' });
                                response.end(`failed to create directory: ${err.stack}`);
                                return;
                            }
                        }
                        else {
                            if (!file_name) {
                                response.writeHead(405, { 'content-type': 'text/plain' });
                                response.end(`a file_name is required to create a directory`);
                                return;
                            }
                            // create directory with file_name
                            try {
                                await mkdir(join(full_path, file_name));
                            }
                            catch (err) {
                                response.writeHead(500, { 'content-type': 'text/plain' });
                                response.end(`failed to create directory: ${err.stack}`);
                                return;
                            }
                        }
                    }
                    break;
                default:
                    response.writeHead(405, { 'content-type': 'text/plain' });
                    response.end(`unknown upload opt, can be 'file','dir'`);
                    return;
            }
            response.writeHead(200, { 'content-type': 'text/plain' });
            response.end('ok');
            return;
        }
        // handle as data about object being referenced in path
        response.writeHead(200, { 'content-type': 'text/plain' });
        response.end('ok');
    }
    async handle_get_file(request, response) {
        let req_path_given = request.params["path"];
        let path = '/' + (req_path_given || '');
        let full_path = join(this.search_path, path);
        let req_url = request.parsed_url;
        console.log('full_path', full_path);
        console.log(`path: "${path}"`);
        let stats = null;
        try {
            stats = await stat(full_path);
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                console.log(err);
                response.writeHead(500, { 'content-type': 'text/plain' });
                response.end(`server error: ${err.stack}`);
                return;
            }
        }
        let is_file = stats && stats.isFile();
        let is_dir = stats && stats.isDirectory();
        if (is_file || is_dir) {
            if (req_url.searchParams.has('download')) {
                let base = basename(full_path);
                let filename = base.length === 0 ? 'root' : base;
                let read_file = '';
                let made_tar = false;
                console.log('filename', filename);
                if (is_dir) {
                    response.setHeader('content-type', 'application/gzip');
                    filename += '.tgz';
                    read_file = `/tmp/${Date.now()}`;
                    made_tar = true;
                    let options = {
                        cwd: full_path,
                        file: read_file
                    };
                    try {
                        await tar.create(options, ['./']);
                    }
                    catch (err) {
                        console.error(err);
                        response.writeHead(500, { 'content-type': 'text/plain' });
                        response.end('error when creating archive');
                        return;
                    }
                }
                else {
                    response.setHeader('content-type', 'application/octet-stream');
                    read_file = full_path;
                }
                try {
                    let read_stream = createReadStream(read_file);
                    response.writeHead(200, {
                        'content-disposition': `inline; filename="${filename}"`
                    });
                    // @ts-ignore
                    await pp(read_stream, response);
                }
                catch (err) {
                    // @ts-ignore
                    read_stream.end();
                    if (made_tar && await exists(read_file))
                        await unlink(read_file);
                    throw err;
                }
                response.end();
                if (made_tar)
                    await unlink(read_file);
            }
            else {
                response.setHeader('content-type', 'text/html');
                if (is_dir) {
                    let dir_list = [];
                    try {
                        dir_list = await readdirStats(full_path);
                    }
                    catch (err) {
                        console.error(err);
                        response.writeHead(500);
                        response.end(`<pre>server error: ${err.stack}</pre>`);
                        return;
                    }
                    response.write(await renderDir(path, full_path, dir_list));
                }
                else {
                    let file_data = await readFile(full_path);
                    response.write(await renderFile(path, full_path, stats, file_data));
                }
                response.end();
            }
        }
        else {
            response.writeHead(404, { 'content-type': 'text/plain' });
            response.end(`not found`);
        }
    }
    async handle_delete_file(request, response) {
        let path = '/' + request.params['path'];
        let full_path = join(this.search_path, path);
        let stats = null;
        try {
            stats = await stat(full_path);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                response.writeHead(404, { 'content-type': 'text/plain' });
                response.end('not found');
            }
            else {
                response.writeHead(500, { 'content-type': 'text/plain' });
                response.end('server error');
            }
            return;
        }
        if (stats.isFile()) {
            await unlink(full_path);
        }
        else if (stats.isDirectory()) {
            await rmdirRec(full_path);
        }
        response.writeHead(200, { 'content-type': 'text/plain' });
        response.end('ok');
    }
    async load(server) {
        server.router.addMdlwr(null, '/', {}, (req, res) => this.handle_root_redirect(req, res));
        server.router.addRoute(route_methods.get, '/fs/:path*', {}, (req, res) => this.handle_get_file(req, res));
        server.router.addRoute(route_methods.post, '/fs/:path*', {}, (req, res) => this.handle_post_file(req, res));
        server.router.addRoute(route_methods.delete, '/fs/:path*', {}, (req, res) => this.handle_delete_file(req, res));
        server.router.addRoute(null, '/error', {}, async (request, response) => {
            if (request.parsed_url.searchParams.has('during_res')) {
                response.writeHead(200, { 'content-type': 'text/plain' });
            }
            throw new Error('TEST ERROR');
        });
        server.router.addRoute(null, '/force_close', {}, async (request, response) => {
            response.writeHead(200, { 'content-type': 'text/plain' });
            response.end(() => {
                process.exit(0);
            });
        });
    }
}
