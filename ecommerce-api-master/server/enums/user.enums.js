const Enum = require('enum');

exports.UserRole = new Enum({
    "Admin" : 0,
    "WE" : 1,
    "WE_HOME" : 2,
    "HUB" : 3,
    "GENERALCONTRACTOR" : 4,
    "WE_FREE": 5
});

exports.OrderUserRole = new Enum({
    "WE" : "01",
    "WE_HOME" : "02",
    "HUB" : "03",
    "GENERALCONTRACTOR" : "04",
    "WE_FREE" : "05"
})