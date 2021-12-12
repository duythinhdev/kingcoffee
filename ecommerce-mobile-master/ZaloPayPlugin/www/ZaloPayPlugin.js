var exec = require('cordova/exec');

exports.payOrder = function (arg0, success, error) {
    exec(success, error, 'ZaloPayPlugin', 'payOrder', [arg0]);
};
