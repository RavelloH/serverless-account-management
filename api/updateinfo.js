const prisma = require("../utils/prisma");
const newResponse = require("../utils/response");
const timeMonitor = require("../utils/time");
const token = require("../utils/token");
const limitControl = require("../utils/limitControl")

console.log("[Request]", "Update Info");

const editableProperty = [
    'nickname',
    'bio',
    'birth',
    'country',
    'website',
    'avatar',
    'gender'
]

function filterObject(properties, object) {
    const filteredObject = {};
    if (typeof object === 'object' && object !== null) {
        for (const property of properties) {
            if (object.hasOwnProperty(property)) {
                filteredObject[property] = object[property];
            }
        }
    }
    return filteredObject;
}



module.exports = (req, res) => {
    startTime = Date.now();
    const info = req.body;
    if (typeof info == 'undefined') {
        newResponse(res, 400, "请提供必要的参数");
        return
    }
    if (typeof info == 'string') {
        try {
            info = JSON.parse(info)
        } catch (e) {
            newResponse(400, "无法解析此请求", e)
        }
    }
    console.log("[Info]", timeMonitor(startTime), info);

    infoJSON = info

    if (typeof req.headers.authorization == 'undefined') {
        newResponse(400, '请提供验证信息')
    }

    limitControl.check(req).then((rate) => {
        if (rate) {
            // 检查传入的token
            const tokenString = req.headers.authorization.split(' ')[1];
            try {
                tokenInfo = token.verify(tokenString)
            } catch(err) {
                console.log(err)
                if (err.name == 'TokenExpiredError') {
                    newResponse(res, 410, 'TOKEN已过期，请重新登录')
                } else {
                    newResponse(res, 400, 'TOKEN无效')
                }
            }

            // 更新信息
            if (tokenInfo) {
                console.log('TokenInfo:', tokenInfo)
                console.log(req.body)
                console.log(filterObject(editableProperty,req.body))
                
                // 请求新信息
                prisma.user.update({
                    where: {
                        uid: tokenInfo.uid
                    },
                    data: filterObject(editableProperty,req.body)
                }).then((result) => {

                    updateTime(result.uid, startTime)
                    newResponse(res, 200, "修改成功", {
                        update: filteredObject
                    });


                })
                return
            }
        } else {
            newResponse(res, 429, "已触发速率限制")
        }
    })
    limitControl.update(req)
}