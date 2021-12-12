const Enum = require('enum');

exports.PaymentMethod = new Enum({
    "InvestWallet" : 0,
    "MoMo" : 1,
    "COD" : 2,
    "VNPay": 3,
    "ZaloPay": 4
});

exports.PaymentType = new Enum({
    //Receiver pay shipping fee
    "ReceiverPay": 1,
    //Sender pay shipping fee
    "SenderPay": 2
});

exports.ShipmentType = new Enum({
    "HubOrder": 1,
    "WeOrder": 2,
    "WeHomeOrder": 3
});