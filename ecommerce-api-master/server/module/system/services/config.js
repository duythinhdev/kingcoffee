const redis = require('redis');

const portRedis = process.env.REDIS_PORT || 6379;
const hostRedis = process.env.REDIS_HOST || '127.0.0.1';
const redisClient = redis.createClient(portRedis, hostRedis);

const redisKey = 'public-config';
const expire = 60 * 60 * 2; // 2 hours

exports.getRedisData = async (key) => {
  try {
    return new Promise((resolve, reject) =>
      redisClient.get(key, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }));
  } catch (e) {
    throw e;
  }
}

async function clearRedisData() {
  try {
    return new Promise((resolve, reject) =>
      redisClient.flushall((err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }));
  } catch (e) {
    throw e;
  }
}

exports.publicConfig = async ({ queryCountry, ip, resetRedis = false }) => {
  try {
    //reset redis data
    if (resetRedis) {
      await clearRedisData();
    }
    let data = await this.getRedisData(redisKey);
    if (data) {
      data = JSON.parse(data);
    } else {
      const [items, languages] = await Promise.all([
        DB.Config.find({ public: true }).exec(),
        DB.I18nLanguage.find({ isActive: true })
      ]);

      data = {};
      items.forEach((item) => {
        data[item.key] = item.value;
      });

      const defaultLanguage = languages.filter(lang => lang.isDefault).map(lang => lang.key);
      data.i18n = {
        languages: languages.map(lang => ({
          key: lang.key,
          name: lang.name
        })),
        defaultLanguage: defaultLanguage && defaultLanguage.length ? defaultLanguage[0] : 'vi'
      };
      // TODO - use currency exchange rate to show here
      let country = queryCountry;
      if (!country) {
        let countryData;
        try {
          // countryData = await Service.Country.getCountryByIp(ip);
        } catch (e) {
          countryData = null;
        }

        if (countryData) {
          country = countryData.countryCode;
        }
      }
      let countryCurrency;
      if (country) {
        countryCurrency = Service.Currency.getCurrencyByCountryCode(country);
      }
      const siteCurrency = process.env.SITE_CURRENCY;
      const siteCurrencyData = Service.Currency.getCurrencyByCode(process.env.SITE_CURRENCY);
      const siteCurrencySymbol = siteCurrencyData ? siteCurrencyData.symbolNative : '₫';
      data.customerCurrency = countryCurrency ? countryCurrency.code : siteCurrency;
      // try {
      //   data.customerRate = await Service.Currency.getRate(siteCurrency, countryCurrency.code);
      // } catch (e) {
      //   data.customerRate = 1;
      // }
      data.customerRate = 1;
      data.customerCurrencySymbol = countryCurrency ? countryCurrency.symbolNative : siteCurrencySymbol;

      redisClient.setex(redisKey, expire, JSON.stringify(data));
    }

    return data;
  } catch (e) {
    throw e;
  }
};

exports.tradeDiscount = async () => {
  try {
    const getConfig = await DB.Config.findOne({ key: 'tradeDiscount' });
    if (!getConfig) {
      throw new Error('Không tìm thấy chiết khấu!');
    }

    const data = {
      tradeDiscountUser: getConfig.value.tradeDiscountUser,
      tradeDiscountSeller: getConfig.value.tradeDiscountSeller
    };

    return data;
  } catch (e) {
    throw e;
  }
};
