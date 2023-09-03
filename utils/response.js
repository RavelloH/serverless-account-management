function newResponse(response, statusCode, message, inner) {
    response.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Platform-Name': 'RPlatform'
    })
    
    let returnMessage = {
        'code': statusCode,
        'message': message,
        'inner': inner ? JSON.stringify(inner) : {}
    }
    let messageJson = JSON.stringify(returnMessage,null,2)
    
    console.log('[Return]',statusCode,returnMessage)
    response.end(returnMessage)
}

module.exports = newResponse;