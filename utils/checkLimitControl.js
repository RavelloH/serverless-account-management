const prisma = require('./prisma');

async function checkLimitControl(request) {
    const ip =
        request.headers['x-real-ip'] ||
        request.headers['x-forwarded-for'] ||
        request.ip ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress ||
        '';
    const currentTime = new Date();

    // 检查ip是否超过每分钟20次的限制
    const count = await prisma.requestLog.count({
        where: {
            ip: ip,
            requestTime: {
                gte: new Date(currentTime.getTime() - 60000),
            },
        },
    });

    await prisma.$disconnect();
    return count <= 20;
}

module.exports = checkLimitControl;
