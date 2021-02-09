#!/usr/bin/env node
const utils = require('intest-cli-dev-utils')
// console.log('111')
// console.log(utils)

const importLocal = require('import-local')
const npmlog = require('npmlog')
if(importLocal(__filename)) {
    npmlog.info('cli', '正在使用本地版本')
} else {
    require('../lib')(process.argv.slice(2))
}