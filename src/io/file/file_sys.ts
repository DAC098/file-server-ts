import * as fs from 'fs';
import { join } from 'path';

export interface stat_extend extends fs.Stats {
    name: string,
    dir: string,
    children: stat_extend[] 
}

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

export const readdirStats = async (path: string, recursive: number = 0): Promise<stat_extend[]> => {
    let dir_list = await readdir(path);
    let rtn_list: stat_extend[] = [];

    for(let item of dir_list) {
        let full_path = join(path,item);
        let stats = await stat(full_path);

        stats['name'] = item;
        stats['dir'] = path;

        if(stats.isDirectory && recursive > 0) {
            stats['children'] = await readdirStats(full_path,recursive--);
        } else {
            stats['children'] = [];
        }

        // @ts-ignore
        rtn_list.push(stats);
    }

    return rtn_list;
}

export const rmdir = (path: string): Promise<void> => {
    return new Promise((resolve,reject) => {
        fs.rmdir(path,err => {
            if(err)
                reject(err);
            else
                resolve();
        })
    });
}

export const rmdirRec = async (path: string): Promise<void> => {
    let contents = await readdirStats(path);

    if(contents.length !== 0) {
        for(let stat of contents) {
            if(stat.isDirectory()) {
                await rmdirRec(join(path + stat.name));
            } else {
                await unlink(join(path,stat.name));
            }
        }
    }

    await rmdir(path);
}