import { dirname } from "path";
import { exists, unlink } from "./file_sys";
import { createWriteStream } from "fs";
import pp from "../../pp";
// @ts-ignore
import tar from 'tar';

export interface upload_options {
    /**
     * treats the upload as a tar archive and will unpack once data has been written
     */
    unpack?: boolean,

    /**
     * will delete the archive file once it has been unpacked
     */
    delete_unpack?: boolean,

    /**
     * overwrites existing file if present
     */
    overwrite?: boolean
}

const setOptions = (options: upload_options): void => {
    let overwrite_type = typeof options['overwrite'];
    let unpack_type = typeof options['unpack'];
    let delete_unpack_type = typeof options['delete_unpack'];

    if(overwrite_type === 'undefined') {
        options['overwrite'] = false;
    } else if(overwrite_type !== 'boolean') {
        throw new TypeError(`invalid value given for overwrite. must be a boolean, given: ${overwrite_type}`);
    }

    if(unpack_type === 'undefined') {
        options['unpack'] = false;
    } else if(unpack_type !== 'boolean') {
        throw new TypeError(`invalid value given for unpack. must be a boolean, given: ${unpack_type}`);
    }

    if(delete_unpack_type === 'undefined') {
        options['delete_unpack'] = false
    } else if(delete_unpack_type !== 'boolean') {
        throw new TypeError(`invalid value given for delete_unpack. must be a boolean, given: ${delete_unpack_type}`);
    }
}

/**
 * 
 * @param path path to create the file in
 * @param instream the readable stream to use for the file data
 * @param options
 */
const uploadFile = async (path: string, instream: ReadableStream, options: upload_options = {}): Promise<void> => {
    let directory = dirname(path);

    setOptions(options);

    console.log('upload options:',options)

    if(!exists(directory,'dir')) {
        throw new Error('directory does not exist');
    }

    if(exists(path) && !options['overwrite']) {
        throw new Error('file already exists');
    }

    let ostream = createWriteStream(path);

    // @ts-ignore
    await pp(instream,ostream);

    if(options['unpack']) {
        let unpack_options: tar.ExtractOptions & tar.CreateOptions & tar.FileOptions = {
            cwd: directory,
            file: path
        };

        console.log('extract options:',unpack_options);

        let result = await tar.extract(unpack_options);

        console.log('result?',result);
    }

    if(options['unpack'] && options['delete_unpack']) {
        await unlink(path);
    }
}

export default uploadFile;