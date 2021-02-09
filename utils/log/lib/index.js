'use strict';
const log = require('npmlog')

// log
// module.exports = index;

// function index() {
//     log.info('intest-cli-dev-log', 'test')
// }
log.addLevel('success', 2000, { fg: 'green' })
// 降级处理 log
log.level = process.env.LOG_LEVEL || 'info'
//c 添加前缀
log.heading = 'intest' 
module.exports = log
