const {
    PrismaClient
} = require("@prisma/client");
const newResponse = require("../utils/response");
const timeMonitor = require("../utils/time");
const pack = require("../utils/pack");

console.log("[Request]", "Get info");
const prisma = new PrismaClient();

let startTime;

module.exports = (req, res) => {
    startTime = Date.now();
    const {
        uid
    } = req.query;

    // 获取信息
    if (uid) {
        prisma.user.findUnique({
            where: {
                uid: parseInt(uid)
            }
        }).then((result) => {
            newResponse(res, 200, "信息获取成功", {
                info: pack(result, startTime)
            });
        })
    } else {
        newResponse(res, 400, "请提供uid")
    }
};