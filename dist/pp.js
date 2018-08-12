// @ts-ignore
import pump from 'pump';
const pp = (...streams) => {
    return new Promise((resolve, reject) => {
        pump(streams, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
export default pp;
