const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

exports.uploadFile = async (filePathTemp, options = {}) => {
  try {
    let filePath;
    if (fs.existsSync(filePathTemp)) {
      filePath = filePathTemp;
    } else if (fs.existsSync(path.resolve(filePathTemp))) {
      filePath = path.resolve(filePathTemp);
    } else if (fs.existsSync(path.join(process.env.APP_ROOT_DIR, filePathTemp))) {
      filePath = path.join(process.env.APP_ROOT_DIR, filePathTemp);
    } else {
      throw new Error(`File path ${filePath} does not exist!`);
    }

    let fileName = path.parse(filePath).base;
    const ext = fileName.split('.').pop();

    // create slug from file name, remove ext
    // remove ext
    // 1) convert to lowercase
    // 2) remove dashes and pluses
    // 3) remove everything but alphanumeric characters and dashes
    // 4) replace spaces with dashes
    fileName = options.fileName || `${Math.random().toString(36).substring(7)}-${fileName
      .replace(/\.[^/.]+$/, '')
      .toLowerCase().replace(/-+/g, '')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/\s+/g, '-')}.${ext}`;

    const stream = fs.createReadStream(filePath);
    const form = new FormData();
    form.append('file', stream, fileName);
    const formHeader = form.getHeaders()

    const resp = await axios.post(`${process.env.STORAGE_API}/api/v1/storages/files/single`, 
      form,
      {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        ...formHeader,
        'channelId': 'tni-ecom'
      }
    })
    return {
      key: fileName,
      url: resp.data.link
    }
    
  } catch (e) {
    throw e;
  }
};

/**
 * delete S3 file
 * @param  {String/Array}   key filename
 * @param  {Function} cb
 * @return {Promise}
 */
exports.deleteFile = async (key) => {
  try {
    const keys = !Array.isArray(key) ? [key] : key;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Delete: {
        Objects: keys.map(k => ({ Key: k }))
      }
    };

    return new Promise((resolve, reject) => {
      const s3 = new AWS.S3();
      s3.deleteObjects(params, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    });
  } catch (e) {
    throw e;
  }
};
