function newResponse(statusCode, inner, message) {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'code': statusCode,
            'message': message,
            'inner': inner
        })
    }
}

module.exports = newResponse;