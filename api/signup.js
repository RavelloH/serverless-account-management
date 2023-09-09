const {
    PrismaClient
} = require("@prisma/client");
const argon2 = require("argon2");
const newResponse = require("../utils/response");
const shuffler = require("../utils/shuffler");
const timeMonitor = require("../utils/time");
console.log("[Request]", "Sign Up");
const prisma = new PrismaClient();

let startTime;

// 注册器
async function signup(username, nickname, email, password) {
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
    console.log("[Info]", timeMonitor(startTime), info);

    let infoJSON = JSON.parse(info);
    console.log("[InfoJSON]", timeMonitor(startTime), infoJSON);

    // 验证格式
    if (
        !infoJSON.username ||
        !infoJSON.email ||
        !infoJSON.nickname ||
        !infoJSON.password
    ) {
        newResponse(res, 400, "缺少必须的参数");
        return
    }

    // 验证密码格式
    if (infoJSON.password.length !== 32) {
        newResponse(res, 400, "密码位数不正确，需要32位");
        return
    }
    
    // 验证长度 
    if (
        infoJSON.username.length > 10 ||
        infoJSON.nickname > 50
    ) {
        newResponse(res, 400, "用户名/昵称长度超过限制");
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