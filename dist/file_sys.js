import * as fs from 'fs';
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
