const prisma = require('../utils/prisma');
const newResponse = require('../utils/response');
const timeMonitor = require('../utils/time');
const token = require('../utils/token');
const limitControl = require('../utils/limitControl');

console.log('[Request]', 'Update Info');

const editableProperty = ['nickname', 'bio', 'birth', 'country', 'website', 'avatar', 'gender'];

function filterObject(properties, objects) {
    const filteredObject = {};
    if (typeof objects === 'object' && objects !== null) {
        for (let property in objects) {
            if (objects.hasOwnProperty(property) && properties.includes(property)) {
                filteredObject[property] = objects[property];
            }
        }
    }
    return filteredObject;
}

module.exports = (req, res) => {
    startTime = Date.now();
    const info = req.body;
    if (typeof info == 'undefined') {
        newResponse(res, 400, '请提供必要的参数');
        return;
    }
    if (typeof info == 'string') {
        try {
            info = JSON.parse(info);
        } catch (e) {
            newResponse(400, '无法解析此请求', e);
        }
    }
    console.log('[Info]', timeMonitor(startTime), info);

    infoJSON = info;

    if (typeof req.headers.authorization == 'undefined') {
        newResponse(400, '请提供验证信息');
        return
    }

    limitControl.check(req).then((rate) => {
        if (rate) {
            // 检查传入的token
            const tokenString = req.headers.authorization.split(' ')[1];
            try {
                tokenInfo = token.verify(tokenString);
            } catch (err) {
                console.log(err);
                if (err.name == 'TokenExpiredError') {
                    newResponse(res, 410, 'TOKEN已过期，请重新登录');
                } else {
                    newResponse(res, 400, 'TOKEN无效');
                }
            }

            // 更新信息
            if (tokenInfo) {
                console.log('TokenInfo:', tokenInfo);

                let filteredObject = filterObject(
                    editableProperty,
                    JSON.parse(JSON.stringify(info)),
                );
                // 请求新信息
                prisma.user
                    .update({
                        where: {
                            uid: tokenInfo.uid,
                        },
                        data: filteredObject,
                    })
                    .then((result) => {
                        newResponse(res, 200, '修改成功', {
                            update: filteredObject,
                        });
                    })
                    .catch((e) => {
                        newResponse(res, 400, '修改失败：一项或多项属性值不合法', {
                            error: e,
                        });
                    });
                return;
            }
        } else {
            newResponse(res, 429, '已触发速率限制');
        }
    });
    limitControl.update(req);
};
