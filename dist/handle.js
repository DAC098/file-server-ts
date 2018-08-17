import { constants } from 'http2';
import router from './router';
import { performance } from 'perf_hooks';
const logRoute = (code, method, url, version, scheme, data = {}) => {
    return `${typeof data['text'] === 'string' && data['text'].length !== 0 ? data['text'] + ': ' : ''}${method} ${code} ${url} HTTP/${version}${scheme === 'https' ? ' SSL' : ''}${typeof data['time'] === 'number' ? ' ' + data['time'].toPrecision(3) + ' ms' : ''}`;
};
const handle = async (request, response) => {
    let path = request.url;
    let authority = request.headers[':authority'] || request.headers['host'];
    let scheme = request.headers[':scheme'] || 'encrypted' in request.socket ? 'https' : 'http';
    let version = request.httpVersion;
    let method = request.method;
    let start_time = performance.now();
    let router_result;
    try {
        router_result = await router.run(request, response);
    }
    catch (err) {
        console.error(err);
        console.error('route durring error', router.current_route);
        if (response.headersSent) {
            console.error(logRoute(response.statusCode, method, path, version, scheme, {
                text: 'error when responding'
            }));
            if ('stream' in response) {
                if (!response.stream.destroyed) {
                    response.stream.close(constants.NGHTTP2_INTERNAL_ERROR);
                }
            }
            else {
                // @ts-ignore
                response.destroy();
            }
        }
        else {
            console.error(logRoute(500, method, path, version, scheme, {
                text: 'server error'
            }));
            response.writeHead(500, { 'content-type': 'text/plain' });
            response.end();
        }
        return;
    }
    let end_time = performance.now() - start_time;
    if (!router_result) {
        console.log(logRoute(404, method, path, version, scheme, {
            text: 'not found'
        }));
        response.writeHead(404, { 'content-type': 'text/plain' });
        response.end('not found');
        return;
    }
    console.log(logRoute(response.statusCode, method, path, version, scheme, { time: end_time }));
};
export default handle;
