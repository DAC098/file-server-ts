import path from "path";
import process from 'process';
import Module from 'module';

const baseURL = new URL('file:://');
baseURL.pathname = `${process.cwd()}/`;

export async function resolve(specifier, parentModuleURL = baseURL, defaultResolver) {
    let parsed = path.parse(specifier);

    // console.log(parsed);
    // console.log(parentModuleURL);

    if(Module.builtinModules.includes(specifier)) {
        return {
            url: specifier,
            format: 'builtin'
        }
    }

    if (/^\.{0,2}[/]/.test(specifier)) {
        if(parsed.ext.length === 0) {
            specifier += '.js'
        }
    
        return {
            url: new URL(specifier, parentModuleURL).href,
            format: 'esm'
        }
    } else {
        return defaultResolver(specifier, parentModuleURL);
    }
}