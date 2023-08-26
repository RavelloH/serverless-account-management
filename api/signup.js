const {
    PrismaClient
} = require('@prisma/client')
const argon2 = require('argon2');
const newResponse = require('../utils/response')
const shuffler = require('../utils/shuffler')
const prisma = new PrismaClient()

async function signup(username, nickname, email, password) {
    let encryptPassword = await encrypt(password)
    console.log('pwd', encryptPassword)
    await prisma.user.create({
        data: {
            username: username,
            nickname: nickname,
            email: email,
            password: encryptPassword
        },
    })
    return newResponse(200,undefined,'注册成功')
}
function encrypt(password) {
    const pwd = shuffler(password);
    console.log('[shuffler]', pwd)
    const options = {
        timeCost: 3,
        memoryCost: 65536,
        parallelism: 8,
        hashLength: 32
    }
    const hashedPassword = argon2.hash(shuffler(password), options);
    return hashedPassword
}

module.exports = (req, res) => {
    const {
        info
    } = req.query;
    console.log('[info]', info)
    let infoJSON = JSON.parse(info)
    console.log('[infoJSON]', infoJSON)
    signup(infoJSON.username, infoJSON.nickname, infoJSON.email, infoJSON.password)
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
}