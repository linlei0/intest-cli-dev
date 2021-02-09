'use strict';
const { isObject } = require('intest-cli-dev-utils')
const formatPath = require('intest-cli-dev-format-path')
const path = require('path')
const fse = require('fs-extra')
const pkgDir = require('pkg-dir').sync
const npminstall = require('npminstall')
const { getDefaultRegistry, getNpmLatest } = require('get-npm-info')
const pathExists = require('path-exists').sync

// _axios@0.21.1@axios
class Package {
    constructor(options) {
        if (!options || !isObject(options)) {
            throw new Error('参数options不能为空，且只能为对象！')
        }
        // console.log(' packgae constructor')
        // package路径
        this.targetPath = options.targetPath
        // package存储路径
        this.storePath = options.storePath
        // 缓存package的路径
        this.storeDir = options.storeDir
        // package的name
        this.packageName = options.packageName
        // package的version
        this.packageVersion = options.packageVersion
        // package缓存前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_')

    }

    get cacheFilePath() {
        return path.resolve(this.storeDir, `_${this.packageName}@${this.packageVersion}@${this.packageName}`)
    }

    getSpecificFilePath(packVersion) {
        return path.resolve(this.storeDir, `_${this.packageName}@${packVersion}@${this.packageName}`)
    }
    // package安装
    async install() {
        await this.prepare()
        return npminstall({
            root: this.targetPath, // 跟路径
            pkgs: [
                { name: this.packageName, version: this.packageVersion }, // 包名
            ],
            storeDir: this.storeDir, // 存放路径
            registry: getDefaultRegistry(false) // 下载源地址
        })
    }
    async prepare() {
        if (this.storeDir && !pathExists(this.storeDir)) {
            fse.mkdirpSync(this.storeDir) // 创建目录
        }
        if (this.packageVersion === 'latest') {
            this.packageVersion = await getNpmLatest(this.packageName, getDefaultRegistry())
        }
    }
    // 判断当前package是否存在
    async exists() {
        if (this.storeDir) {
            await this.prepare()
            console.log(this.cacheFilePath)
            return pathExists(this.cacheFilePath)
        } else {
            return pathExists(this.targetPath)
        }
    }

    // 更新
    async update() {
        await this.prepare()
        // 1.查询最新模块版本号
        const lastestPackageVersion = await getNpmLatest(this.packageName, getDefaultRegistry())
        console.log(lastestPackageVersion)
        // 2.查询最新版本号对应路径是否存在
        const lastestFilePath = this.getSpecificFilePath(lastestPackageVersion)
        // 3.如果不存在则直接更新
        if (!pathExists(lastestFilePath)) {
            return npminstall({
                root: this.targetPath, // 跟路径
                pkgs: [
                    { name: this.packageName, version: lastestPackageVersion }, // 包名
                ],
                storeDir: this.storeDir, // 存放路径
                registry: getDefaultRegistry(false) // 下载源地址
            })
        }
        this.packageVersion = lastestPackageVersion
        return lastestFilePath


    }

    // 获取入口文件代码
    getRootFilePath() {

        function _getRootFile(targetPath) {
            // 1.获取package.json所在目录
            const dir = pkgDir(targetPath)
            if (dir) {
                // 2.读取package.json
                const pkgFile = path.resolve(dir, 'package.json')
                const pkg = require(pkgFile)
                // 寻找main/bin
                if (pkgFile && pkg.main) {
                    // 3.兼容windows /macos
                    return formatPath(path.resolve(dir, pkg.main))
                }
            }
            return null
        }

        if (this.storeDir) {
            return _getRootFile(this.cacheFilePath)
        } else {
            return _getRootFile(this.targetPath)
        }
    }
}

module.exports = Package
