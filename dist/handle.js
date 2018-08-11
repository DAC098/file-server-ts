import { join, basename, dirname } from "path";
import { exists } from "./file_sys";
import renderDir from "./render/renderDir";
import renderFile from "./render/renderFile";
import pp from './pp';
import { createReadStream } from "fs";
// @ts-ignore
import tar from 'tar';
import router from './router';
const search_path = '/';
const handle = async (request, response) => {
    let router_result;
    try {
        router_result = await router.run(request, response);
    }
    catch (err) {
        console.error(err);
    }
    if (typeof router_result === 'boolean') {
        if (router_result) {
            console.log('handled route');
        }
        else {
            console.log('unhandled route');
        }
    }
    else {
        console.log('undefined return type');
        if(!request.aborted) {
            let sent_head = response.headersSent;

            if(!sent_head) {
                console.log('setting headers');
                response.writeHead(500,{'content-type': 'text/plain'});
            }

            if(sent_head) {
                console.log("ending response");
                response.end();
            } else {
                console.log('sending server error');
                response.end('server error');
            }
        } else {
            console.log('request aborted');
        }
    }
    return;
    let path = request.url;
    let authority = request.headers[':authority'] || request.headers['host'];
    let scheme = request.headers[':scheme'] || 'encrypted' in request.socket ? 'https' : 'http';
    let version = request.httpVersion;
    console.log(`${request.method} ${request.url} HTTP/${version}${scheme === 'https' ? ' SSL' : ''}`);
    let req_url = new URL(path, `${scheme}://${authority}`);
    let full_path = join(search_path, req_url.pathname);
    let is_file = await exists(full_path, 'file');
    let is_dir = await exists(full_path, 'dir');
    if (is_file || is_dir) {
        if (req_url.searchParams.has('download')) {
            let read_stream;
            let filename = basename(full_path);
            if (is_dir) {
                response.setHeader('content-type', 'application/gzip');
                filename += '.tgz';
                let options = {
                    cwd: dirname(full_path)
                };
                read_stream = tar.create(options, [basename(full_path)]);
            }
            else {
                response.setHeader('content-type', 'application/octet-stream');
                read_stream = createReadStream(full_path);
            }
            response.writeHead(200, {
                'content-disposition': `inline; filename="${filename}"`
            });
            await pp(read_stream, response);
            response.end();
        }
        else {
            response.writeHead(200, { 'content-type': 'text/html' });
            if (is_dir) {
                response.write(await renderDir(req_url.pathname, full_path));
            }
            else {
                response.write(await renderFile(req_url.pathname, full_path));
            }
            response.end();
        }
    }
    else {
        response.writeHead(404, { 'content-type': 'text/plain' });
        response.end(`not found`);
    }
};
export default handle;
