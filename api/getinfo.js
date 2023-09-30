const prisma = require('../utils/prisma');
const newResponse = require('../utils/response');
const timeMonitor = require('../utils/time');
const pack = require('../utils/pack');
const limitControl = require('../utils/limitControl');

console.log('[Request]', 'Get info');

let startTime;

module.exports = (req, res) => {
    startTime = Date.now();
    const { uid } = req.query;

    if (uid) {
        limitControl.check(req).then((result) => {
            if (result) {
                prisma.user
                    .findUnique({
                        where: {
                            uid: parseInt(uid),
                        },
                    })
                    .then((result) => {
                        newResponse(res, 200, '信息获取成功', {
                            info: pack(result, result.lastUseAt),
                        });
                    });
            } else {
                newResponse(res, 429, '已触发速率限制');
            }
        });
    } else {
        newResponse(res, 400, '请提供uid');
    }

    limitControl.update(req);
};
