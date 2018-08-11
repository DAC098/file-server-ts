import * as events from 'events';
import * as http2 from 'http2';
import * as fs from 'fs';
import {stat,readFile, unlink, writeFile} from '../file_sys';
import {exec} from '../exec';
import { AddressInfo } from 'net';

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

export interface handleCallback {
    (request: http2.Http2ServerRequest, response: http2.Http2ServerResponse): Promise<void>
}

export default class Server extends events.EventEmitter {
    private options: server_options;
    
    private server_setup: http2.SecureServerOptions;
    private instance: http2.Http2SecureServer;

    private server_created: boolean;
    private created_setup: boolean;
    private server_listening: boolean;

    private handle: handleCallback;
    private handle_created: boolean;

    constructor() {
        super();

        this.server_created = false;
        this.created_setup = false;
        this.server_listening = false;
        this.handle_created = false;
    }

    async handleRequest(
        request: http2.Http2ServerRequest,
        response: http2.Http2ServerResponse
    ): Promise<void> {
        if(this.handle_created) {
            try {
                await this.handle(request,response);
            } catch(err) {
                console.log(err);

                if(response.headersSent) {
                    response.end();
                } else {
                    response.writeHead(500,{'content-type': 'text/plain'});
                    response.end('server error');
                }
            }
        } else {
            response.writeHead(200,{'content-type': 'text/plain'});
            response.end('ok');
        }
    }

    setHandle(cb: handleCallback): void {
        this.handle_created = true;
        this.handle = cb;
    }

    async createServerOptions(options: server_options): Promise<void> {
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
                        let rsa_result = await exec(`openssl genrsa -out ${key_path} 4096`);
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
                        let cert_result = await exec(`openssl req -new -x509 -key ${key_path} -out ${cert_path} -days 365 -config ${config_path}`);
                        let cert_text_result = await exec(`openssl req -new -x509 -key ${key_path} -noout -days 365 -config ${config_path} -text`);

                        await writeFile(cert_details_path,cert_text_result.stdout);
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
            (request,response) => this.handleRequest(request,response)
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