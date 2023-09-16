const {
    PrismaClient
} = require("@prisma/client");
const argon2 = require("argon2");
const newResponse = require("../utils/response");
const shuffler = require("../utils/shuffler");
const timeMonitor = require("../utils/time");
const pack = require("../utils/pack");
const token = require("../utils/token");

console.log("[Request]", "Get info");
const prisma = new PrismaClient();

let startTime;

module.exports = (req, res) => {
    startTime = Date.now();
    const {
        info
    } = req.query;
    if (typeof info == 'undefined') {
        newResponse(res, 400, "请提供必要的参数");
        return
    }

    console.log("[Info]", timeMonitor(startTime), info);

    let infoJSON = JSON.parse(info);

    console.log("[InfoJSON]", timeMonitor(startTime), infoJSON);

    // 检验token是否有效
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

    // 获取信息
    if (tokenInfo) {
        prisma.user.findUnique({
            where: {
                uid: infoJSON.uid
            }
        }).then((result) => {
            updateTime(result.uid, startTime)
            newResponse(res, 200, "信息获取成功", {
                info: pack(result, startTime),
                token: token.sign(pack(result, startTime))
            });
        })
    }
};