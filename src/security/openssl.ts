import { exec } from "../exec";
import { writeFile } from "../io/file/file_sys";

export interface req_options {
    key?: string,
    days?: number,
    config?: string,
    text?: boolean,
    noout?: boolean
}

export const genrsa = async (out_path: string, key_size: number = 2048): Promise<void> => {
    let rsa_result = await exec(`openssl genrsa -out "${out_path}" ${key_size}`);
}

export const genrsaBuffer = async (key_size: number = 2048): Promise<Buffer> => {
    let rsa_result = await exec(`openssl genrsa ${key_size}`);

    return rsa_result.stdout;
}

export const req = async (out_path: string, options: req_options = {}): Promise<void> => {
    let args_list = [];
    let output_as_text: boolean = typeof options["text"] === "boolean" ? options["text"] : false;

    for(let k in options) {
        let type = typeof options[k];

        if (type !== "undefined") {
            if(type === "boolean") {
                if(options[k]) {
                    args_list.push(`-${k}`);
                }
            } else {
                args_list.push(`-${k} ${options[k]}`);
            }
        }
    }

    if(!output_as_text)
        args_list.push(`-out "${out_path}"`);

    let cert_result = await exec(`openssl req -new -x509 ${args_list.join(" ")}`);

    if(output_as_text)
        await writeFile(out_path,cert_result.stdout);
}

export const reqBuffer = async (options: req_options = {}): Promise<Buffer> => {
    let args_list = [];

    for(let k in options) {
        let type = typeof options[k];

        if (type !== "undefined") {
            if(type === "boolean") {
                if(options[k]) {
                    args_list.push(`-${k}`);
                }
            } else {
                args_list.push(`-${k} ${options[k]}`);
            }
        }
    }

    let cert_result = await exec(`openssl req -new -x509 ${args_list.join(" ")}`);

    return cert_result.stdout;
}