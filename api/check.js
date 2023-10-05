const prisma = require('../utils/prisma');
const newResponse = require('../utils/response');
const timeMonitor = require('../utils/time');
const pack = require('../utils/pack');
const limitControl = require('../utils/limitControl');

console.log('[Request]', 'Check');

let startTime;
let queryStartTime

async function getDBInfo() {
    const userNum = await prisma.user.count()
    const postNum = await prisma.post.count()
    const maxId = await prisma.requestLog.findMany({
        orderBy: {
            id: 'desc',
        },
        select: {
            id: true,
        },
        take: 1,
    });
    return {
        id: process.env.DB_ID,
        user: userNum,
        post: postNum,
        request: maxId[0].id
    }
}

module.exports = (req, res) => {
    startTime = Date.now();
    limitControl.check(req).then((result) => {
        if (result) {
            queryStartTime = Date.now();
            getDBInfo()
            .then((result) => {
                newResponse(res, 200, `服务运行正常，平均查询耗时: ${Date.now() - queryStartTime}ms`, result);
            })
            .catch((e)=> {
                newResponse(res, 400, '服务无法正常运行', {
                    error: e
                });
            });
        } else {
            newResponse(res, 429, '已触发速率限制');
        }
    });

    limitControl.update(req);
};