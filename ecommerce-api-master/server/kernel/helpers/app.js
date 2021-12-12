const url = require('url');
const nconf = require('nconf');
const mongoose = require('mongoose');
const _ = require('lodash');
const enums = require('../../enums');

exports.isObjectId = str => (/^[a-fA-F0-9]{24}$/.test(str));

exports.isMongoId = str => (/^[a-fA-F0-9]{24}$/.test(str));

exports.toObjectId = str => mongoose.Types.ObjectId(str);

/**
 * get public file url in the public folder with absolute url
 *
 * @param  {String} filePath
 * @return {String}
 */
exports.getPublicFileUrl = (filePath) => {
  if (!filePath || Helper.String.isUrl(filePath)) {
    return filePath;
  }

  // local file, replace, remove public
  const newPath = filePath.indexOf('../public/') === 0 ? filePath.replace('../public/', '') : filePath;
  return url.resolve(nconf.get('baseUrl'), newPath);
};

/**
 * populate search mongo search query
 * @type {Object}
 */
exports.populateDbQuery = (query, options = {}) => {
  const match = {};
  (options.text || []).forEach((k) => {
    if (query[k]) {
      if (k === '_id') {
        match[k] = { $in: query[k].trim() };
      } else {
        match[k] = { $regex: query[k].trim(), $options: 'i' };
      }
    }
  });

  (options.boolean || []).forEach((k) => {
    if (['false', '0'].indexOf(query[k]) > -1) {
      match[k] = false;
    } else if (query[k]) {
      match[k] = true;
    }
  });

  (options.equal || []).forEach((k) => {
    if (query[k]) {
      match[k] = query[k].toLowerCase();
    }
  });

  return match;
};

/**
 * get sort query for mongo db
 *
 * @param  {[type]} query                     express query object
 * @param  {String} [defaultSort='createdAt'] default sort field
 * @param  {Number} [defaultSortType=-1]      default sort type, -1, 1, desc or asc
 * @return {Object} mongo db sort query
 */
exports.populateDBSort = (query, defaultSort = 'createdAt', defaultSortType = -1) => {
  const sort = {};
  if (query.sort) {
    sort[query.sort] = ['asc', '1'].indexOf(query.sortType) > -1 ? 1 : -1;
  } else {
    sort[defaultSort] = defaultSortType;
  }

  return sort;
};

exports.groupBy = (objectArray, property) => objectArray.reduce((acc, obj) => {
  const key = obj[property];
  if (!acc[key]) {
    acc[key] = [];
  }
  acc[key].push(obj);
  return acc;
}, {});

exports.removeAccents = (str) => {
  str = str.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/g,"");
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g,"d");
  str = str.replace(/\-/g," ");
  str = str.replace(/ +(?= )/g,"");
  str = str.trim();
  str = str.replace(/\s/g,"-");
  
  return str;
} 

// hàm deep replace key cho mảng object
const _replaceKeysDeep = (obj, keysMap) => {
  return _.transform(obj, function(result, value, key) {

    var currentKey = keysMap[key] || key;

    result[currentKey] = _.isObject(JSON.parse(JSON.stringify(value))) ? _replaceKeysDeep(value, keysMap) : JSON.parse(JSON.stringify(value));
  });
}

// call hàm deep replace key cho mảng object
exports.replaceKeysDeep = (obj, keysMap) => {
  return _replaceKeysDeep(obj, keysMap);
}

// hàm deep replace value cho object
const _replaceValuesDeep = (attrName, changeValueFunc, object) => {
  _.each(object, (val, key) => {
    if (attrName.indexOf(key) > -1) {
      object[key] = changeValueFunc(object[key]);
    } else if (typeof(val) === 'object' || typeof(val) === 'array') {
      object[key] = _replaceValuesDeep(attrName, changeValueFunc, val);
    }
  });

  return object;
}

exports.replaceValuesDeep = (attrName, changeValueFunc, object) => {
  return _replaceValuesDeep(attrName, changeValueFunc, object)
}


// lấy key object khi biết value
exports.getKeyEnumWithValue = (enums, value) => {
  enums = JSON.parse(JSON.stringify(enums));
  for (const [key, enumValue] of Object.entries(enums)) {
    if(enumValue === value){
      return key;
    }
  }
}

exports.isJSON = (text) => {
  return (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
  replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
  replace(/(?:^|:|,)(?:\s*\[)+/g, '')));
}
