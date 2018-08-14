import Router, { route_methods } from "./Routing/Router";
import { join, basename } from "path";
import { exists, unlink, stat, readdirStats, readFile } from "./file_sys";
import renderDir from "./render/renderDir";
import renderFile from "./render/renderFile";
import pp from './pp';
import { createReadStream } from "fs";
// @ts-ignore
import tar from 'tar';
const router = new Router();
const search_path = '/';
export default router;
router.addRoute(route_methods.get, '/fs/:path*', {}, async (request, response) => {
    let path = '/' + request.params['path'];
    let full_path = join(search_path, path);
    let req_url = request.parsed_url;
    // console.log('full_path',full_path);
    // console.log(`path: "${path}"`);
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
            let read_stream;
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
                read_stream = createReadStream(read_file);
                response.writeHead(200, {
                    'content-disposition': `inline; filename="${filename}"`
                });
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
});
router.addRoute(null, '/error', {}, async (request, response) => {
    if (request.parsed_url.searchParams.has('during_res')) {
        response.writeHead(200, { 'content-type': 'text/plain' });
    }
    throw new Error('TEST ERROR');
});
router.addRoute(null, '/force_close', {}, async (request, response) => {
    response.writeHead(200, { 'content-type': 'text/plain' });
    response.end(() => {
        process.exit(0);
    });
});
