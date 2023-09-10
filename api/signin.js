const {
    PrismaClient
} = require("@prisma/client");
const argon2 = require("argon2");
const newResponse = require("../utils/response");
const shuffler = require("../utils/shuffler");
const timeMonitor = require("../utils/time");
const pack = require("../utils/pack");

console.log("[Request]", "Sign In");
const prisma = new PrismaClient();

let startTime;
let isPasswordOK
let shufflerPassword

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

    let infoJSON = JSON.parse(info);

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
                console.log(result)
                // 验证密码
                shufflerPassword = shuffler(infoJSON.password)
                argon2.verify(result[0].password, shufflerPassword).then((passwordValidate) => {
                    isPasswordOK = passwordValidate
                })
                console.log("[isPasswordOK]", timeMonitor(startTime), isPasswordOK);
                if (isPasswordOK) {
                    newResponse(res, 200, "登录成功", pack(result[0]));
                } else {
                    newResponse(res, 400, "密码错误");
                }
            }
        })

    } else {
        newResponse(res, 400, "缺少必须的参数");
        return
    }
};