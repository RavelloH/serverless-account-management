const prisma = require('../utils/prisma');
const newResponse = require('../utils/response');
const timeMonitor = require('../utils/time');
const token = require('../utils/token');
const argon2 = require('argon2');
const shuffler = require('../utils/shuffler');
const limitControl = require('../utils/limitControl');

console.log('[Request]', 'Update Password');

function encrypt(password) {
    const pwd = shuffler(password);
    console.log('[Shuffler Done]', timeMonitor(startTime));
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
    const info = req.body;
    if (typeof info == 'undefined') {
        newResponse(res, 400, '请提供必要的参数');
        return;
    }
    if (typeof info == 'string') {
        try {
            info = JSON.parse(info);
        } catch (e) {
            newResponse(400, '无法解析此请求', e);
        }
    }
    console.log('[Info]', timeMonitor(startTime), info);

    infoJSON = info;

    if (!info.account ||
        !info.password ||
        !info.newPassword
    ) {
        newResponse(res,400, '请提供账号/密码/新密码');
        return
    }

    // 长度验证
    if (info.password.length < 6 || info.newPassword.length < 6) {
        newResponse(res, 400, '密码位数不正确，最少6位');
        return;
    }

    limitControl.check(req).then((rate) => {
        if (rate) {
            // 检查是否存在账号
            prisma.user
            .findFirst({
                where: {
                    OR: [{
                        email: infoJSON.account,
                    },
                        {
                            username: infoJSON.account,
                        },
                    ],
                },
            })
            .then((result) => {
                if (result == null) {
                    newResponse(res, 400, '未找到此账号，请先注册');
                } else {
                    console.log(result);
                    // 验证密码
                    shufflerPassword = shuffler(infoJSON.password);
                    argon2.verify(result.password, shufflerPassword).then((passwordValidate) => {
                        isPasswordOK = passwordValidate;
                        if (isPasswordOK) {
                            // 修改密码
                            encrypt(info.newPassword).then((encryptPassword)=> {
                                prisma.user
                                .update({
                                    where: {
                                        uid: result.uid,
                                    },
                                    data: {
                                        password: encryptPassword
                                    }
                                })
                            })

                            newResponse(res, 200, '修改成功',);
                        } else {
                            newResponse(res, 400, '密码错误');
                        }
                    });
                }
            });
        } else {
            newResponse(res, 429, '已触发速率限制');
        }
    });
    limitControl.update(req);
};