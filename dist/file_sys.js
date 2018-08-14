import * as fs from 'fs';
import { join } from 'path';
export const stat = (file_path) => {
    return new Promise((resolve, reject) => {
        fs.stat(file_path, (err, stat) => {
            if (err)
                reject(err);
            else
                resolve(stat);
        });
    });
};
export const readFile = (path, options) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, options, (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
};
export const writeFile = (path, data, options) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, options, (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
export const mkdir = (path, mode) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, mode, (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
export const unlink = (path) => {
    return new Promise((resolve, reject) => {
        fs.unlink(path, (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
export const exists = async (path, type = '') => {
    try {
        let stats = await stat(path);
        switch (type) {
            case 'dir':
                return stats.isDirectory();
            case 'link':
                return stats.isSymbolicLink();
            case 'file':
            default:
                return stats.isFile();
        }
    }
    catch (err) {
        if (err.code !== 'ENOENT')
            throw err;
        return false;
    }
};
export const readdir = (path) => {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err)
                reject(err);
            else
                resolve(files);
        });
    });
};
export const readdirStats = async (path, recursive = 0) => {
    let dir_list = await readdir(path);
    let rtn_list = [];
    for (let item of dir_list) {
        let full_path = join(path, item);
        let stats = await stat(full_path);
        stats['name'] = item;
        stats['dir'] = path;
        if (stats.isDirectory && recursive > 0) {
            stats['children'] = await readdirStats(full_path, recursive--);
        }
        else {
            stats['children'] = [];
        }
        // @ts-ignore
        rtn_list.push(stats);
    }
    return rtn_list;
};
