const checkLimitControl = require("./checkLimitControl")
const updateLimitControl = require("./updateLimitControl")

const limitControl = {
    check: function(req) {
        checkLimitControl(req)
    },
    update: function(req) {
        updateLimitControl(req)
    }
}

module.exports = limitControl;