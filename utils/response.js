function newResponse(response, statusCode, message, inner) {
  let returnMessage = {
    code: statusCode,
    message: message,
    inner: inner ? inner : {},
  };

  console.log("[Return]", statusCode, messageJson);
  response.json(returnMessage);
}

module.exports = newResponse;
