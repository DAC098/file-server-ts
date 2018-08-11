import * as fs from 'fs';

export const stat = (file_path: fs.PathLike): Promise<fs.Stats> => {
    return new Promise((resolve,reject) => {
        fs.stat(file_path,(err: Error,stat: fs.Stats) => {
            if(err)
                reject(err);
            else
                resolve(stat);
        });
    });
}

export const readFile = (path: fs.PathLike, options?: Object): Promise<Buffer> => {
    return new Promise((resolve,reject) => {
        fs.readFile(path,options,(err: Error,data: Buffer) => {
            if(err)
                reject(err);
            else
                resolve(data);
        });
    })
}

export const writeFile = (path: fs.PathLike, data: any, options?: Object): Promise<void> => {
    return new Promise((resolve,reject) => {
        fs.writeFile(path,data,options,(err: Error) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
}

export const mkdir = (path: fs.PathLike, mode?: string | number): Promise<void> => {
    return new Promise((resolve,reject) => {
        fs.mkdir(path,mode,(err: Error) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
}

export const unlink = (path: fs.PathLike): Promise<void> => {
    return new Promise((resolve,reject) => {
        fs.unlink(path,(err: Error) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
}

export const exists = async (path: fs.PathLike,type: string = ''): Promise<boolean> => {
    try {
        let stats = await stat(path);

        switch(type) {
            case 'dir':
                return stats.isDirectory();
            case 'link':
                return stats.isSymbolicLink();
            case 'file':
            default:
                return stats.isFile();
        }
    } catch(err) {
        if(err.code !== 'ENOENT')
            throw err;
        
        return false;
    }
}

export const readdir = (path: fs.PathLike): Promise<string[]> => {
    return new Promise((resolve,reject) => {
        fs.readdir(path,(err,files) => {
            if(err)
                reject(err);
            else
                resolve(files);
        });
    });
}