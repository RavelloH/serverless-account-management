function timeMonitor(startTime) {
    return parseInt(new Date.now() - startTime)
}

module.exports = timeMonitor;