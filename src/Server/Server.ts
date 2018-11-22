import * as events from 'events';
import * as http2 from 'http2';
import { performance } from 'perf_hooks';
import { stat, readFile, unlink } from '../io/file/file_sys';
import { AddressInfo } from 'net';
import Extension from './Extension';
import Router, { route_result } from '../Routing/Router';
import { dirname, join } from 'path';
import * as openssl from "../security/openssl";
import SQLPool from "../psql/SQLPool";
import { Readable, Writable } from 'stream';
// import { ServerResponse, ServerRequest } from 'http';

interface log_data {
    text?: string,
    time?: number
}
// @ts-ignore
export interface server_request extends http2.Http2ServerRequest, Readable {
    parsed_url: URL,
    params: {[s: string]: string | null},
    db: SQLPool,
    user: object
};
export type server_response = http2.Http2ServerResponse & Writable;

export interface server_options {
    host: string,
    port: number,
    backlog: number,
    alpn?: boolean,
    tls?: {
        make_cert?: boolean,
        force_create?: boolean,
        key_path?: string,
        cert_path?: string
    }
}

export default class Server extends events.EventEmitter {
    private options: server_options;
    
    private server_setup: http2.SecureServerOptions;
    private instance: http2.Http2SecureServer;

    private server_created: boolean;
    private created_setup: boolean;
    private server_listening: boolean;

    public extensions_directory: string;
    private loaded_extensions: Extension[];

    private router_instance: Router;

    constructor() {
        super();

        this.server_created = false;
        this.created_setup = false;
        this.server_listening = false;

        this.router_instance = new Router();
        this.loaded_extensions = [];

        // @ts-ignore
        let local_path = new URL(import.meta["url"]);
        this.extensions_directory = join(dirname(local_path.pathname),"../extensions");
    }

    public get router() {
        return this.router_instance;
    }

    public logRoute(code: number,method: string, url: string,version: string,scheme: string,data: log_data = {}): string {
        return `${typeof data['text'] === 'string' && data['text'].length !== 0 ? data['text'] + ': ' : ''}${method} ${code} ${url} HTTP/${version}${scheme === 'https' ? ' SSL' : ''}${typeof data['time'] === 'number' ? ' ' + data['time'].toPrecision(3) + ' ms' : ''}`;
    }

    private async handleRequest(
        request: server_request,
        response: server_response
    ): Promise<void> {
        let path = request.url;
        let authority = request.headers[':authority'] || request.headers['host'];
        let scheme = request.headers[':scheme'] || 'encrypted' in request.socket ? 'https' : 'http';
        let version = request.httpVersion;
        let method = request.method;

        let start_time = performance.now();

        let router_result: route_result;

        try {
            router_result = await this.router.run(request, response);
        } catch(err) {
            console.error(err);
            console.error('route durring error', this.router.current_handle);

            if(response.headersSent) {
                console.error(this.logRoute(response.statusCode,method,path,version,scheme,{
                    text: 'error when responding'
                }));

                if('stream' in response) {
                    if(!response.stream.destroyed) {
                        response.stream.close(http2.constants.NGHTTP2_INTERNAL_ERROR);
                    }
                } else {
                    response.destroy();
                }
            } else {
                console.error(this.logRoute(500,method,path,version,scheme,{
                    text:'server error'
                }));

                response.writeHead(500,{'content-type':'text/plain'});
                response.end("server error");
            }

            return;
        }

        let end_time = performance.now() - start_time;

        // console.log("router result:", router_result);

        if (router_result === route_result.not_found || router_result === route_result.invalid_method) {
            if (response.headersSent) {
                console.warn("headers have been sent. cannot send default response");
            } else {
                switch (router_result) {
                    case route_result.not_found:
                        response.writeHead(404, {'content-type':'text/plain'});
                        response.end("not found");
                        break;
                    case route_result.invalid_method:
                        response.writeHead(405, {"content-type": "text/plain"});
                        response.end("method not allowed");
                        break;
                }
            }
        }

        console.log(this.logRoute(response.statusCode,method,path,version,scheme,{time:end_time}));
    }

    public async loadExtensions(): Promise<void> {
        this.loaded_extensions = await Extension.loadDirectory(this, this.extensions_directory);
    }

    public async loadCoreHandless(): Promise<void> {

    }

    public async createServerOptions(options: server_options): Promise<void> {
        let opts: http2.SecureServerOptions = {};

        if(typeof options !== 'object') {
            throw new Error('no setup given');
        }

        opts.allowHTTP1 = "alpn" in options ? options.alpn : false;

        if('tls' in options) {
            let found_files = false;
            let make_certs = typeof options.tls.make_cert === 'boolean' ? options.tls.make_cert : false;

            if('key_path' in options.tls && 'cert_path' in options.tls && !make_certs) {
                try {
                    let key_stats = await stat(options.tls.key_path);
                    let cert_stats = await stat(options.tls.cert_path);
        
                    if(key_stats.isFile() && cert_stats.isFile()) {
                        opts.key = await readFile(options.tls.key_path);
                        opts.cert = await readFile(options.tls.cert_path);
    
                        found_files = true;
                    }
                } catch(err) {
                    if(err.code !== 'ENOENT')
                        throw err;
                }
            }
            
            if (!found_files || make_certs) {
                let force_create = typeof options.tls.force_create === 'boolean' ? options.tls.force_create : false;

                let pwd = process.cwd();
                let found_key = false;
                let found_cert = false;
                let key_path = `${pwd}/openssl/localhost.key`;
                let cert_path = `${pwd}/openssl/localhost.cert`;
                let config_path = `${pwd}/openssl/config.cnf`;
                let cert_details_path = `${pwd}/openssl/localhost_details.txt`;

                try {
                    let key_stats = await stat(key_path);

                    if(key_stats.isFile()) {
                        if(force_create) {
                            await unlink(key_path);
                        } else {
                            found_key = true;
                        }
                    }
                } catch(err) {
                    if(err.code !== 'ENOENT')
                        throw err;
                }

                try {
                    if(!found_key) {
                        let rsa_result = await openssl.genrsa(key_path,4096);
                    }
                    
                    opts.key = await readFile(key_path);
                } catch(err) {
                    throw err;
                }

                try {
                    let cert_stats = await stat(cert_path);

                    if(cert_stats.isFile()) {
                        if(force_create) {
                            await unlink(cert_path);
                        } else {
                            found_cert = true;
                        }
                    }
                } catch(err) {
                    if(err.code !== 'ENOENT')
                        throw err;
                }

                try {
                    if(!found_cert) {
                        let cert_life_time = 365;

                        let cert_result = await openssl.req(cert_path,{
                            key: key_path,
                            days: cert_life_time,
                            config: config_path
                        });
                        let cert_text_result = await openssl.req(cert_details_path,{
                            key: key_path,
                            days: cert_life_time,
                            config: config_path,
                            text: true,
                            noout: true
                        });
                    }

                    opts.cert = await readFile(cert_path);
                } catch(err) {
                    throw err;
                }
            }
        }

        this.server_setup = opts;
        this.created_setup = true;
        this.options = options;
    }

    start(): Promise<void> {
        if(!this.created_setup)
            throw new Error('no server setup created');

        if(this.server_created)
            return;
        
        this.instance = http2.createSecureServer(
            this.server_setup,
            (request,response) => this.handleRequest(
                <server_request>request,
                <server_response>response
                )
        );

        this.server_created = true;

        return new Promise((resolve) => {
            this.instance.listen(
                this.options.port,
                this.options.host,
                this.options.backlog,
                () => {
                    this.server_listening = true;
                    resolve();
            });
        });
    }

    async stop(): Promise<void> {

    }

    address(): AddressInfo | string | null {
        if(this.server_listening)
            return this.instance.address();
        else
            return null;
    }
}