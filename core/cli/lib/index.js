'use strict';
const path = require('path')
const semver = require('semver')
const chalk = require('chalk')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const dotEnv = require('dotenv')
const args = require('minimist')(process.argv.slice(2))
const pkg = require('../package.json')
const log = require('intest-cli-dev-log')
const init = require('intest-cli-dev-init')
const exec = require('intest-cli-dev-exec')
const { getNpmSemverVersion } = require('get-npm-info')
const { LOW_NODE_VERSION, DEFAULT_CLI_HOME } = require('./const');

const commander = require('commander')
const program = new commander.Command()

let config
// console.log(getNpmInfo)
function core() {
    try {
        prepace()
    } catch (e) {
        log.error(e.message)
        if(program.debug) {
            console.log(e)
        }
    }
}

function registryCommand() {
    program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targerPath <targetPath>', '是否指定本地调试文件路径', '')

    program
    .command('init [projectName]')
    .option('-f,--force', '是否强制初始化项目')
    .action(exec)

    // 开启debug模式
    program.on('option:debug', function(){
        if (program.debug) {
            process.env.LOG_LEVEL = 'verbose'
        } else {
            process.env.LOG_LEVEL = 'info'
        }
        log.level = process.env.LOG_LEVEL
        log.verbose('test')
    })

    // 监听targetPath,并设置环境变量
    program.on('option:targerPath', function() {
        // console.log(this.targerPath)
        process.env.CLI_TARGET_PATH = this.targerPath
    })

    // 对未知命令进行监听
    program.on('command:*', function(obj) {
        // 获取所有注册的命令
        const allRegistryCommand = program.commands.map(cmd=>cmd.name())
        console.log(chalk.red('未知命令：' + obj[0]))
    })
   
    program.parse(process.argv)
    // 后面调用
    // console.log(program.args)
    if(program.args && !program.args.length){
        program.outputHelp()
    }
}

async function prepace() {
    checkPkgVersion()
    // checkNodeVersion()
    checkRoot()
    checkUserHome()
    // checkInputArgs()
    checkEnv()
    checkGlobalUpdate()
    registryCommand()
}

async function checkGlobalUpdate() {
    // 1.获取当前版本号和模块名
    // 2.调用npm API获取说有的版本号和模块名
    // 3.提取所有版本版本号，比对那些版本号是大于当前版本号的
    // 4.获取最新的版本号，提示用户更新到该版本号
    const { version, name } = pkg
    const lastVersion = await getNpmSemverVersion(version, name)
    if(lastVersion && semver.gt(lastVersion,version)) log.warn(chalk.yellow(`请手动更新${name} 当前版本：${version} 最新版本：${lastVersion}`))
    
    // else log.info('已经是最新版本')
}

function checkEnv() {
    const dotEnvPath = path.resolve(userHome, '.env')

    if (pathExists(dotEnvPath)) {
        config = dotEnv.config({
            path: dotEnvPath
        })
    } else {
        log.error('找不到.env')
    }
    createDefaultConfig()

}

function createDefaultConfig() {
    const cliConfig = {
        home: userHome,

    }
    if(process.env.CLI_HOME) {
        cliConfig['cli_home'] = path.join(userHome, process.env.CLI_HOME)
    } else {
        cliConfig['cli_home'] = path.join(userHome, DEFAULT_CLI_HOME)
    }
    // console.log(cliConfig)
    process.env['CLI_HOME_PATH'] = cliConfig['cli_home']
}


function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(chalk.red('当前登陆用户主目录不存在！'))
    }
}

function checkRoot() {
    const rootCheck = require('root-check') // 使用之后可降级为用户权限
    rootCheck()
    // console.log(process.getuid()) //判断当前用的权限 0. root

}
// require 加载 支持 .js .json .node 
// 如果加载其他的文件默认加载.js文件处理
function checkPkgVersion() {
    const { version } = pkg
    // log.notice('cli', version)
}

// function checkNodeVersion() {
//     // 1.获取当前node版本好
//     const currentVersion = process.version
//     // 比对最低版本
//     const result = semver.gt(currentVersion, LOW_NODE_VERSION)
//     // console.log(chalk.red(result))
//     if (!result) {
//         throw new Error(chalk.red('当前版本过低，请升级node版本。 ') + chalk.blue(`最低版本: ${LOW_NODE_VERSION}`))
//     }

// }

module.exports = core;

