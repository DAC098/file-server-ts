import Router, {route_methods, route_request} from "./Routing/Router";
import { Http2ServerResponse } from "http2";
import { join, basename } from "path";
import { exists } from "./file_sys";
import renderDir from "./render/renderDir";
import renderFile from "./render/renderFile";
import pp from './pp';
import { createReadStream } from "fs";
import { Stream } from 'stream';
// @ts-ignore
import tar from 'tar';

const router = new Router();
const search_path = '/';

export default router;

router.addRoute(route_methods.get,'/fs/:path*',{},async (request: route_request, response: Http2ServerResponse): Promise<void|boolean> => {
    let path = '/' + request.params['path'];
    let full_path = join(search_path,path);
    let req_url = request.parsed_url;

    console.log('full_path',full_path);
    console.log(`path: "${path}"`);

    let is_file = await exists(full_path,'file');
    let is_dir = await exists(full_path,'dir');

    if(is_file || is_dir) {
        if(req_url.searchParams.has('download')) {
            let read_stream: Stream;
            let base = basename(full_path);
            let filename: string = base.length === 0 ? 'root' : base;

            if(is_dir) {
                response.setHeader('content-type','application/gzip');
                filename += '.tgz';

                let options: tar.CreateOptions = {
                    cwd: full_path
                };

                read_stream = tar.create(options,['./']);
            } else {
                response.setHeader('content-type','application/octet-stream');
                
                read_stream = createReadStream(full_path);
            }

            response.writeHead(200,{
                'content-disposition': `inline; filename="${filename}"`
            });
            
            await pp(read_stream,response);

            response.end();
        } else {
            response.writeHead(200,{'content-type': 'text/html'});

            if(is_dir) {
                response.write(await renderDir(path,full_path));
            } else {
                response.write(await renderFile(path,full_path));
            }

            response.end();
        }
    } else {
        response.writeHead(404,{'content-type': 'text/plain'});
        response.end(`not found`);
    }

    return true;
});

router.addRoute(null,'/',{end:false},async (request,response): Promise<boolean> => {
    response.writeHead(404,{'content-type':'text/plain'});
    response.end('not found');
    return true;
});