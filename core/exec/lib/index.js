// 'use strict';

const Package = require('intest-cli-dev-package')
const log = require('intest-cli-dev-log')
const path = require('path')
const SEETINGS = {
    init: 'axios'
}

const CATCH_DIR = 'dependencies'

async function exec() {
    // console.log(arguments)
    const cmdObj = arguments[arguments.length - 1]
    const cmdName = cmdObj.name() // command name
    const packageName = SEETINGS[cmdName]
    const packageVersion = 'latest'
    let storeDir = ''
    let package = null
    let targetPath = process.env.CLI_TARGET_PATH
    const homePath = process.env.CLI_HOME_PATH
    // log.verbose('targetPath', targetPath)
    // log.verbose('stroePath', stroePath)
    if (!targetPath) {
        targetPath = path.resolve(homePath, CATCH_DIR) // 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules')
        console.log('storeDir', storeDir)

        package = new Package({
            storeDir,
            targetPath,
            packageName,
            packageVersion
        })
        if(await package.exists()) {
            // 更新package 
            console.log('更新package ')
            package.update()
        } else {
            // 安装package
            await package.install()
        }

    } else {
        
        package = new Package({
            targetPath,
            packageName,
            packageVersion
        })

        // console.log(package.exists())
        
    }

    const rootFile = package.getRootFilePath()
    if(rootFile) {
        console.log(rootFile)
        require(rootFile).call(null, Array.from(arguments))

    }

    

}

module.exports = exec;

