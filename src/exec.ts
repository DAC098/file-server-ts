import * as child_process from 'child_process';

export const exec = (command: string, options?: child_process.ExecOptions): Promise<{
    stdout: Buffer,
    stderr: Buffer
}> => {
    return new Promise((resolve,reject) => {
        child_process.exec(command, options, (err: Error,stdout: Buffer,stderr: Buffer) => {
            if(err)
                reject(err);
            else
                resolve({stdout,stderr});
        })
    });
}