const crypto = require('crypto');

exports.createSignature = rawSignature => crypto.createHmac('sha256', process.env.MOMO_SECRET_KEY)
  .update(rawSignature)
  .digest('hex');

exports.createRawSignature = (attributes) => {
  let rawSignature = '';
  for (let i = 0; i < Object.entries(attributes).length; i++) {
    const [key, value] = Object.entries(attributes)[i];
    rawSignature += `${key}=${value}&`;
  }
  if (rawSignature !== '') {
    rawSignature = rawSignature.slice(0, -1);
  }
  return rawSignature;
};
