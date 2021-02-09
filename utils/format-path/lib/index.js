'use strict';
const path = require('path')
module.exports = formatPath;

function formatPath(p) {
    // TODO
    // console.log(111)
    if(p && typeof p === 'string') {
        const sep = path.sep
        // 在macos是 ‘/’ 在windows是'\'
        if(sep === '/') {
            return p
        } else {
            return p.replace(/\\/g, '/')
        }
    }
    return p
}
