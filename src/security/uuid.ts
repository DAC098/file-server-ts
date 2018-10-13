import { randomBytes } from "crypto";

/*
pulled from kelektiv/node-uuid with small modifications
 */

const byte_to_hex_format = [];

for (let i = 0; i < 256; ++i) {
    byte_to_hex_format[i] = (i + 0x100).toString(16).substr(1);
}

const bufferToUUID = (buf): string => {
    let i = 0;

    return ([
        byte_to_hex_format[buf[i++]], byte_to_hex_format[buf[i++]], 
        byte_to_hex_format[buf[i++]], byte_to_hex_format[buf[i++]], '-',
        byte_to_hex_format[buf[i++]], byte_to_hex_format[buf[i++]], '-',
        byte_to_hex_format[buf[i++]], byte_to_hex_format[buf[i++]], '-',
        byte_to_hex_format[buf[i++]], byte_to_hex_format[buf[i++]], '-',
        byte_to_hex_format[buf[i++]], byte_to_hex_format[buf[i++]],
        byte_to_hex_format[buf[i++]], byte_to_hex_format[buf[i++]],
        byte_to_hex_format[buf[i++]], byte_to_hex_format[buf[i++]]
    ]).join('');
}

const uuidV4 = (): Buffer => {
    let random_bytes = randomBytes(16);

    random_bytes[6] = (random_bytes[6] & 0x0f) | 0x40;
    random_bytes[8] = (random_bytes[8] & 0x3f) | 0x80;

    return random_bytes;
}

export const uuidV4StrToBuffer = (uuid: string): Buffer => {
    let values = [];
    let rtn = Buffer.alloc(16,0);
    let str = uuid.replace(/-/g,"");

    for (let i = 0; i < str.length; i += 2) {
        let c1 = str[i];
        let c2 = str[i + 1];

        values.push(parseInt(c1 + c2, 16));
    }

    for (let i = 0; i < values.length; ++i) {
        rtn[i] = values[i];
    }

    return rtn;
}

export const uuidV4Str = (): string => {
    return  bufferToUUID(uuidV4());
}

export default uuidV4;