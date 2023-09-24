const {
    PrismaClient
} = require("@prisma/client");

const prisma = new PrismaClient();

async function rateLimitControl(request) {
    const {
        ip
    } = request;
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

    // 检查ip是否超过每分钟20次的限制
    const count = await prisma.requestLog.count({
        where: {
            ip: ip,
            requestTime: {
                gte: new Date(currentTime.getTime() - 60000),
            },
        },
    });

    return count <= 20;
}