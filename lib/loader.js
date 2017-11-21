/**
 *Intro:Loader Module
 *Author:shine
 *Date:2017/11/12
 */


const fs = require('fs');
const path = require('path');

function isFile(fpath) {
    return fs.statSync(fpath).isFile();
}

function isDir(fpath) {
    return fs.statSync(fpath).isDirectory();
}

function getFileName(fp, suffixLength) {
    const fn = path.basename(fp);
    if (fn.length > suffixLength) {
        return fn.substring(0, fn.length - suffixLength);
    }

    return fn;
}

/**
 * Check file suffix

 * @param fn {String} file name
 * @param suffix {String} suffix string, such as .js, etc.
 */
function checkFileType(fn, suffix) {
    if (suffix.charAt(0) !== '.') {
        suffix = `.${suffix}`;
    }

    if (fn.length <= suffix.length) {
        return false;
    }

    const str = fn.substring(fn.length - suffix.length).toLowerCase();
    suffix = suffix.toLowerCase();
    return str === suffix;
}

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);  // eslint-disable-line
}

function getFunctionsOfClass(instance) {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
}

function loadFile(fp, context) {
    let m = requireUncached(fp);

    if (!m) {
        return false;
    }

    if (typeof m === 'function') {
        // if the module provides a factory function
        // then invoke it to get a instance
        m = m(context);
    }
    const attrs = getFunctionsOfClass(m);
    for (const at of attrs) {
        if (at !== 'constructor' && typeof m[at] === 'function') {
            Object.defineProperty(m, at, {
                value:m[at],
                enumerable: true
            });
        }
    }
    return m;
}


function loadPath(fpath, context) {
    const files = fs.readdirSync(fpath);
    if (files.length === 0) {
        console.warn(`path is empty, path:${fpath}`);
        return false;
    }

    if (fpath.charAt(fpath.length - 1) !== '/') {
        fpath += '/';
    }

    let fp;
    let fn;
    let m;
    const res = {};
    for (let i = 0, l = files.length; i < l; i++) {
        fn = files[i];
        fp = fpath + fn;
        if (isFile(fp) && checkFileType(fn, '.js')) {
            m = loadFile(fp, context);
            if (m) {
                const name = m.name || getFileName(fn, '.js'.length);
                res[name] = m;
            }
        }
    }

    return res;
}


/**
 * Load modules under the path.
 * If the module is a function, loader would treat it as a factory function
 * and invoke it with the context parameter to get a instance of the module.
 * Else loader would just require the module.
 * Module instance can specify a name property and it would use file name as
 * the default name if there is no name property. All loaded modules under the
 * path would be add to an empty root object with the name as the key.
 *
 * @param  {String} mpath    the path of modules. Load all the files under the
 *                           path, but *not* recursively if the path contain
 *                           any sub-directory.
 * @param  {Object} context  the context parameter that would be pass to the
 *                           module factory function.
 * @return {Object}          module that has loaded.
 */
module.exports.load = (mpath, context) => {
    if (!mpath) {
        throw new Error('opts or opts.path should not be empty.');
    }

    try {
        mpath = fs.realpathSync(mpath);
    } catch (err) {
        throw err;
    }

    if (!isDir(mpath)) {
        throw new Error('path should be directory.');
    }

    return loadPath(mpath, context);
};
