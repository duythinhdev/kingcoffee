const _this = this;

exports.isInteger = str => str.match(/^\d+$/);

exports.isFloat = str => str.match(/^\d+\.\d+$/);

exports.isNumber = str => _this.isInteger(str) || _this.isFloat(str);

exports.round = num => Math.round(num * 100) / 100;

exports.randomIntFromRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);