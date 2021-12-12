const crypto = require('crypto');
const moment = require('moment');
const axios = require('axios');

const ChannelId = process.env.CHANNEL_ID || 7;
const urlCartGoogle = process.env.URL_CHART_GOOGLE;
const algorithm = 'aes-256-cbc';
const openSSl = process.env.OPENSSL_KEY;

exports.updateTrustedSocialAccount = async (socialAccount) => {
  try {
    const user = await DB.User.findOne({ _id: socialAccount.userId });
    if (!user || !user.shopId) {
      return false;
    }

    const update = {};
    update[`socialConnected.${socialAccount.social}`] = true;
    await DB.Shop.update({ _id: user.shopId }, {
      $set: update
    });
    return true;
  } catch (e) {
    throw e;
  }
};

exports.getLocation = async (shop) => {
  try {
    const fullStreetAddress = `${shop.address}, ${shop.ward}, ${shop.district}`;
    const address = [
      fullStreetAddress || shop.address,
      shop.city || '',
      shop.state || '',
      shop.zipCode || '700000',
      shop.country || 'Viet Nam'
    ].filter(a => a).join(',');
    const data = await Service.Geo.getLocationFromAddress(address);
    return {
      long: data.longitude || 0,
      lat: data.latitude || 0
    };
  } catch (e) {
    // throw e;
    return {};
  }
};

exports.sendEmailApprove = async (shopId) => {
  try {
    const shop = shopId instanceof DB.Shop ? shopId : await DB.Shop.findOne({ _id: shopId });
    if (!shop) {
      throw new Error('Shop not found');
    }

    return Service.Mailer.send('shop/approve-notification.html', shop.email, {
      subject: 'Cửa hàng của bạn đã được kích hoạt',
      shop: shop.toObject(),
      sellerLink: process.env.sellerWebUrl
    });
  } catch (e) {
    throw e;
  }
};

function encrypt(text) {
  const cipher = crypto.createCipher(algorithm, openSSl);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text) {
  const decipher = crypto.createDecipher(algorithm, openSSl);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

exports.generateLinkQrCode = async ({ userId, shopId, params }) => {
  try {
    const [shop, user] = await Promise.all([
      DB.Shop.findOne({ _id: shopId }, { name: 1, linkQrCode: 1 }),
      DB.UserSocial.findOne({ userId }, { socialInfo: 1 })
    ]);
    if (!shop) {
      throw new Error('Cửa hàng không tồn tại');
    }

    if (params && params.type === 'get') {
      return shop.linkQrCode;
    }

    const url = `${process.env.INVEST_API}/api/v1/PaymentEcommerce/get-qr-vendor`;
    let data = JSON.stringify({
      channelId: ChannelId,
      NameVendor: shop.name
    });
    const response = await axios({
      url: url,
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + user.socialInfo.Token
      },
    });
    shop.linkQrCode = response.data.Data.Url;
    await shop.save();
    if(response.data.Data.Url === null) {
      throw new Error(response.data.Message)
    }
    return response.data.Data.Url;
  } catch (e) {
    throw e;
  }
};
