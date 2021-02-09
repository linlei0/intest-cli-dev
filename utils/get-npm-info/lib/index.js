'use strict';

const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

function getNpmInfo(npmName, registry) {
    // TODO
    if (!npmName) return
    const registryUrl = registry || getDefaultRegistry()
    const res = urlJoin(registryUrl, npmName)
    return axios.get(res).then(resp => {
        if (resp.status === 200) {
            return resp.data
        } else {
            return null
        }
    })
        .catch(err => {
            return Promise.reject(err)
        })
}

function getDefaultRegistry(isOrigin = false) {
    return isOrigin ? 'http://registry.npmjs.org/' : 'http://registry.npm.taobao.org/'
}

async function getNpmVersion(npmName, registry) {
    const data = await getNpmInfo(npmName, registry);
    if (data) {
        // console.log(Object.keys(data.versions))
        const r = Object.keys(data.versions)
        return r
    } else {
        return []
    }
}

function getSemverVersion(baseVersion, versionList) {
    return versionList
    .filter(version => semver.satisfies(version,`^${baseVersion}`))
    .sort((a,b)=>semver.gt(b,a))
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
    const versionList = await getNpmVersion(npmName, registry)
    const newVersions = getSemverVersion(baseVersion, versionList)
    if(newVersions && newVersions.length) return newVersions[0]
    return 
}

async function getNpmLatest(npmName, registry) {
    const versions = await getNpmVersion(npmName, registry)
    if(versions) {
       return versions.sort((a,b)=>semver.gt(a,b))[0]
    }
    return null
}

module.exports = {
    getNpmInfo,
    getNpmVersion,
    getNpmSemverVersion,
    getDefaultRegistry,
    getNpmLatest
};
