'use strict';

const LOW_NODE_VERSION = '13.0.0'
const semver = require('semver')
const chalk = require('chalk')
const log = require('intest-cli-dev-log')
class Command {
    constructor(argv) {
        // console.log(argv)
        this._argv = argv
        let runner = new Promise((resolve, reject)=> {
            let chain = Promise.resolve();
            chain = chain.then(()=> 
                this.checkNodeVersion()
            )
            chain.catch((error)=> {
                log.error('11',error.message)
            })
        })
    }
    // 初始化
    init() {
        throw new error('必须实现')
    }
    // 执行的方法
    exec() {
        throw new error('必须实现')
    }

    checkNodeVersion() {
        // 1.获取当前node版本好
        const currentVersion = process.version
        // 比对最低版本
        const result = semver.gt(currentVersion, LOW_NODE_VERSION)
        // console.log(chalk.red(result))
        if (!result) {
            throw new Error(chalk.red('当前版本过低，请升级node版本。 ') + chalk.blue(`最低版本: ${LOW_NODE_VERSION}`))
        }
    
    }
}

module.exports = Command
