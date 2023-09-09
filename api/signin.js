const {
    PrismaClient
} = require("@prisma/client");
const argon2 = require("argon2");
const newResponse = require("../utils/response");
const shuffler = require("../utils/shuffler");
const timeMonitor = require("../utils/time");
console.log("[Request]", "Sign In");
const prisma = new PrismaClient();

let startTime;

// 密码登录
async function signin(username, nickname, email, password) {
    let encryptPassword = await encrypt(password);
    console.log("[PWD Hash Generated]", timeMonitor(startTime));
    await prisma.user.create({
        data: {
            username: username,
            nickname: nickname,
            email: email,
            password: encryptPassword,
        },
    });
    console.log("[DB Writed]", timeMonitor(startTime));
}

// 加密器
function encrypt(password) {
    const pwd = shuffler(password);
    console.log("[Shuffler Done]", timeMonitor(startTime));
    const options = {
        timeCost: 3,
        memoryCost: 65536,
        parallelism: 8,
        hashLength: 32,
    };
    const hashedPassword = argon2.hash(shuffler(password), options);
    return hashedPassword;
}

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

    try {
        let infoJSON = JSON.parse(info);
    } catch {
        newResponse(res, 400, "参数解析无效");
        return
    }
    console.log("[InfoJSON]", timeMonitor(startTime), infoJSON);

    // 登录模式分发
    if (typeof infoJSON.token !== 'undefined') {
        // JWT 刷新登录

    } else if (typeof infoJSON.account !== 'undefined' && typeof infoJSON.password !== 'undefined') {
        // 密码登录

        // 验证密码长度
        if (infoJSON.password.length !== 32) {
            newResponse(res, 400, "密码位数不正确，需要32位");
            return
        }
        
        // 查询是否有此用户
        prisma.user.findMany({
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
                // 验证密码
                if (await argon2.verify(result.password), shuffler(infoJSON.password ))) {
                    newResponse(res, 200, "登录成功");
                } else {
                    newResponse(res, 400, "密码错误");
                }
            }
        })

    } else {
        newResponse(res, 400, "缺少必须的参数");
        return
    }

    // 检查唯一性
    prisma.user.findMany({
        where: {
            OR: [{
                email: infoJSON.email
            },
                {
                    username: infoJSON.username
                },
            ],
        },
    })
    .then((result) => {
        console.log("[uniqueCheck]", timeMonitor(startTime));
        console.log(result);

        if (result.length !== 0) {
            newResponse(res, 400, "用户名/邮箱已被占用");
        } else {
            // 注册流程
            signup(
                infoJSON.username,
                infoJSON.nickname,
                infoJSON.email,
                infoJSON.password,
            )
            .then(async () => {
                newResponse(res, 200, "注册成功");
                await prisma.$disconnect();
                console.log("[Response]", timeMonitor(startTime));
            })
            .catch(async (e) => {
                console.error(e);
                newResponse(res, 500, "注册失败: " + e);
                await prisma.$disconnect();
            });
        }
    });
};