function pack(userinfo,time) {
    return {
        uid: userinfo.uid,
        username: userinfo.username,
        nickname: userinfo.nickname,
        email: userinfo.email,
        emailVerified: userinfo.emailVerified,
        bio: userinfo.bio,
        birth: userinfo.birth,
        country: userinfo.country,
        role: userinfo.role,
        updatedAt: userinfo.updatedAt,
        createAt: userinfo.createAt,
        lastUseAt: time,
        gender: userinfo.gender,
    }
}

module.exports = pack;