function newResponse(response, statusCode, message, inner) {
    let returnMessage = {
        'code': statusCode,
        'message': message,
        'inner': inner ? JSON.stringify(inner) : {}
    }
    let messageJson = JSON.stringify(returnMessage,null,2)
    
    console.log('[Return]',statusCode,returnMessage)
    response.json(returnMessage)
}

module.exports = newResponse;
