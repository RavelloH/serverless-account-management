function newResponse(response, statusCode, message, inner) {
  let returnMessage = {
    code: statusCode,
    message: message,
    inner: inner ? inner : {},
  };
  let messageJson = JSON.stringify(returnMessage, null, 2);

  console.log("[Return]", statusCode, messageJson);
  response.json(returnMessage);
}

module.exports = newResponse;
