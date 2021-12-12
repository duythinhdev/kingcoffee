const Enum = require('enum');

exports.SendEmailType = new Enum({
    "OrderSuccess" : 0,
    "OrderCancel" : 1,
    "ReAssignHub" : 2,
    "DeliverySuccess": 3
}); 