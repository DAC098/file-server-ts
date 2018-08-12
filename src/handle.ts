import {constants} from 'http2';
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import router from './router';
import { route_run_result } from "./Routing/Router";

const logRoute = (code: number,method: string, url: string,version: string,scheme: string,text?: string): string => {
    return `${typeof text === 'string' && text.length !== 0 ? text + ': ' : ''}${method} ${code} ${url} HTTP/${version}${scheme === 'https' ? ' SSL' : ''}`;
}

const handle = async (request: Http2ServerRequest, response: Http2ServerResponse): Promise<void> => {
    let path = request.url;
    let authority = request.headers[':authority'] || request.headers['host'];
    let scheme = request.headers[':scheme'] || 'encrypted' in request.socket ? 'https' : 'http';
    let version = request.httpVersion;
    let method = request.method;

    let router_result: route_run_result;

    try {
        router_result = await router.run(request,response);
    } catch(err) {
        console.error(err);
        console.error('route durring error',router.current_route);

        if(response.headersSent) {
            console.error(logRoute(response.statusCode,method,path,version,scheme,'error when responding'));

            if('stream' in response) {
                if(!response.stream.destroyed) {
                    response.stream.close(constants.NGHTTP2_INTERNAL_ERROR);
                }
            } else {
                // @ts-ignore
                response.destroy();
            }
        } else {
            console.error(logRoute(500,method,path,version,scheme,'server error'));

            response.writeHead(500,{'content-type':'text/plain'});
            response.end();
        }

        return;
    }

    if(!router_result.found) {
        console.log(logRoute(404,method,path,version,scheme,'not found'));

        response.writeHead(404,{'content-type':'text/plain'});
        response.end('not found');

        return;
    }

    if(!router_result.valid_method) {
        console.log(logRoute(405,method,path,version,scheme,'method not allowed'));

        response.writeHead(405,{'content-type':'text/plain'});
        response.end('method not allowed');

        return;
    }

    console.log(logRoute(response.statusCode,method,path,version,scheme));
}

export default handle;