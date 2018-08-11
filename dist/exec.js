import * as child_process from 'child_process';
export const exec = (command, options) => {
    return new Promise((resolve, reject) => {
        child_process.exec(command, options, (err, stdout, stderr) => {
            if (err)
                reject(err);
            else
                resolve({ stdout, stderr });
        });
    });
};
