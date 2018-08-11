// @ts-ignore
import pump from 'pump';

const pp = (...streams: pump.Stream[]): Promise<void> => {
    return new Promise((resolve,reject) => {
        pump(streams,(err: Error) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
}

export default pp;