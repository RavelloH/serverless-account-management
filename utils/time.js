function timeMonitor(startTime) {
  return parseInt(Date.now() - startTime);
}

module.exports = timeMonitor;
