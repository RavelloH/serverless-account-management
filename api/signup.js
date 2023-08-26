const {
    PrismaClient
} = require('@prisma/client')
const { argon2 } = require("argon2");
const newResponse = require('../utils/response')
const shuffler = require('../utils/shuffler')
const prisma = new PrismaClient()

async function signup(username, nickname, email, password) {
    let encryptPassword = encrypt(password)
    console.log('pwd',encryptPassword)
    await prisma.user.create({
        data: {
            username: username,
            nickname: nickname,
            email: email,
            password: encryptPassword
        },
    })

    const allUsers = await prisma.user.findMany()
    console.dir(allUsers, {
        depth: null
    })
}
async function encrypt(password) {
  const pwd = Buffer.from(shuffler(password));
  const options = {
    timeCost: 4,
    memoryCost: 65536,
    parallelism: 4,
    hashLength: 32,
  };
  const hashedPassword = await argon2.hash(pwd, process.env.HASH_SALT, options);
  return hashedPassword
}

module.exports = (req, res) => {
    const {
        info
    } = req.query;
    console.log('[info]',info)
    let infoJSON = JSON.parse(info)
    console.log('[infoJSON]',infoJSON)
    signup(infoJSON.username,infoJSON.nickname,infoJSON.email,infoJSON.password)
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
}
