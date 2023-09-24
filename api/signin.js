const {
    PrismaClient
} = require("@prisma/client");
const argon2 = require("argon2");
const newResponse = require("../utils/response");
const shuffler = require("../utils/shuffler");
const timeMonitor = require("../utils/time");
const pack = require("../utils/pack");
const token = require("../utils/token");

console.log("[Request]", "Sign In");
const prisma = new PrismaClient();

let startTime;
let isPasswordOK
let shufflerPassword
let infoJSON

// 更新时间
async function updateTime(uid, time) {
    await prisma.user.update({
        where: {
            uid: uid
        },
        data: {
            lastUseAt: time+''
        },
    });
    console.log("[DB Writed]", timeMonitor(startTime));
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


    console.log("[InfoJSON]", timeMonitor(startTime), infoJSON);

    rateLimitControl(req).then((rate) => {
        if (rate) {
            // 登录模式分发
            if (typeof infoJSON.token !== 'undefined') {
                // JWT 刷新登录

                // 检查传入的token
                let tokenInfo
                try {
                    tokenInfo = token.verify(infoJSON.token)
                } catch(err) {
                    console.log(err)
                    if (err.name == 'TokenExpiredError') {
                        newResponse(res, 410, 'TOKEN已过期，请重新登录')
                    } else {
                        newResponse(res, 400, 'TOKEN无效')
                    }
                }

                // 刷新TOKEN
                if (tokenInfo) {
                    console.log('token解码成功', tokenInfo)
                    // 请求新信息
                    prisma.user.findUnique({
                        where: {
                            uid: tokenInfo.uid
                        }
                    }).then((result) => {
                        // 检查此Token是否为最新
                        console.log(result.lastUseAt, tokenInfo.lastUseAt+'')
                        if (result.lastUseAt == tokenInfo.lastUseAt+'') {
                            updateTime(result.uid, startTime)
                            newResponse(res, 200, "登录成功", {
                                info: pack(result, startTime),
                                token: token.sign(pack(result, startTime))
                            });
                        } else {
                            newResponse(res, 420, "Token不处于激活状态");
                        }

                    })
                    return
                }


            } else if (typeof infoJSON.account !== 'undefined' && typeof infoJSON.password !== 'undefined') {
                // 密码登录

                // 验证密码长度
                if (infoJSON.password.length !== 32) {
                    newResponse(res, 400, "密码位数不正确，需要32位");
                    return
                }

                // 查询是否有此用户
                prisma.user.findFirst({
                    where: {
                        OR: [{
                            email: infoJSON.account
                        },
                            {
                                username: infoJSON.account
                            },
                        ],
                    },
                }).then((result) => {
                    if (result.length == 0) {
                        newResponse(res, 400, "未找到此账号，请先注册");
                    } else {
                        console.log(result)
                        // 验证密码
                        shufflerPassword = shuffler(infoJSON.password)
                        argon2.verify(result.password, shufflerPassword).then((passwordValidate) => {
                            isPasswordOK = passwordValidate
                            console.log("[isPasswordOK]", timeMonitor(startTime), isPasswordOK);
                            if (isPasswordOK) {
                                updateTime(result.uid, startTime)
                                newResponse(res, 200, "登录成功", {
                                    info: pack(result, startTime),
                                    token: token.sign(pack(result, startTime))
                                });

                            } else {
                                newResponse(res, 400, "密码错误");
                            }
                        })
                    }
                })

            } else {
                newResponse(res, 400, "缺少必须的参数");
                return
            }
        } else {
            newResponse(res, 429, "已触发速率限制")
        }
    })
};