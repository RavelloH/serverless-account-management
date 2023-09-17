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

    // 获取信息
    if (infoJSON.uid) {
        prisma.user.findUnique({
            where: {
                uid: infoJSON.uid
            }
        }).then((result) => {
            newResponse(res, 200, "信息获取成功", {
                info: pack(result, startTime)
            });
        })
    } else {
        newResponse(res, 400 , "请提供uid")
    }
};