const gm = require('gm');
var Jimp = require('jimp');
const path = require('path');
const fs = require('fs');
const base64Img = require('base64-img');
const config = require('../config');

exports.gm = gm;

exports.resize = async (options) => {
  const width = parseInt(options.width);
  const height = parseInt(options.height);
  const inputFile = fs.existsSync(options.input) ? options.input : path.resolve(options.input);
  const fileName = options.outputName || `${Helper.String.getFileName(options.input, true)}_${width}x${height}.png`;
  const outputFile = path.join(path.dirname(inputFile), fileName);
  // TODO - custom for ouput?
  const background = options.background || 'transparent';
  const resizeOption = options.resizeOption || '';

  return new Promise((resolve, reject) => {
    Jimp.read(inputFile, (err, image) => {
      if (err) {
        reject(err);
        return
      }

      image
      .resize(width, height, resizeOption)
      
      .write(outputFile, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(outputFile);
      })
    });
  });
};

// TODO - define folder
exports.saveBase64Image = async (base64String, options = {}) => {
  const originalname = options.name || `${Helper.String.randomString(5)}.png`;
  const nameWithoutExt = Helper.String.createAlias(Helper.String.getFileName(originalname, true));
  const ext = base64String.indexOf('image/jpeg') > -1 ? 'jpg' : 'png';
  let fileName = `${nameWithoutExt}.${ext}`;
  if (fs.existsSync(path.resolve(config.photoDir, fileName))) {
    fileName = `${nameWithoutExt}-${Helper.String.randomString(5)}`;
  } else {
    fileName = `${nameWithoutExt}`;
  }

  return new Promise((resolve, reject) => {
    base64Img.img(base64String, path.resolve(config.photoDir), fileName, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve({
        path: `${config.photoDir}${fileName}.${ext}`,
        mimetype: ext === 'jpg' ? 'image/jpeg' : 'image/png',
        filename: originalname
      });
    });
  });
};
