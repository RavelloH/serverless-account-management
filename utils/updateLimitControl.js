const prisma = require("./prisma");

async function updateLimitControl(request) {
    const ip = request.headers['x-real-ip'] ||
    request.headers['x-forwarded-for'] ||
    request.ip ||
    request.connection.remoteAddress ||
    request.socket.remoteAddress ||
    request.connection.socket.remoteAddress || '';
    const currentTime = new Date();
    
    // 存储请求信息至数据库
    await prisma.requestLog.create({
        data: {
            ip: ip,
            requestTime: currentTime,
        },
    });

    // 删除五分钟以前的存储结果
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    await prisma.requestLog.deleteMany({
        where: {
            requestTime: {
                lt: fiveMinutesAgo,
            },
        },
    });

}

module.exports = updateLimitControl;