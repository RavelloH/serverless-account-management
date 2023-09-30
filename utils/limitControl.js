const checkLimitControl = require('./checkLimitControl');
const updateLimitControl = require('./updateLimitControl');

const limitControl = {
    check: function (req) {
        return checkLimitControl(req);
    },
    update: function (req) {
        return updateLimitControl(req);
    },
};

module.exports = limitControl;
