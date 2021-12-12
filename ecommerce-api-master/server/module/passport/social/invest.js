const Joi = require('@hapi/joi');
const SECURITY_KEY = process.env.SECURITY_KEY || 6;

exports.login = async (req, res, next) => {
  if(req.headers.platform === 'web'){
    return next(PopulateResponse.error(
      {
        message: 'WE4.0 đã có phiên bản mới nhất trên chợ ứng dụng. Vui lòng cập nhật phiên bản để được trải nghiệm tốt nhất.'
      },
      'WE4.0 đã có phiên bản mới nhất trên chợ ứng dụng. Vui lòng cập nhật phiên bản để được trải nghiệm tốt nhất.',
      400,
      400
    ));
  }
  try {
    const schema = Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string()
        .min(6)
        .required(),
      twoFaCode: Joi.string().allow(null, ''),
      deviceId: Joi.string().allow(null, '')
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const loginInvestToken = await Service.SocialConnect.Invest.crossLogin(
      req.body.username.trim(),
      req.body.password,
      req.body.twoFaCode,
      req.body.deviceId
    );

    if (!loginInvestToken) {
      return next(PopulateResponse.error(
        {
          message: 'Tên người dùng hoặc mật khẩu không đúng'
        },
        'ERR_USER_INVALID',
        400,
        400
      ));
    }else{
      var currentUserData = await Service.SocialConnect.Invest.getUserMe(loginInvestToken);
      res.locals.login = await Service.SocialConnect.Invest.saveUserMe(req, currentUserData, loginInvestToken);
    }

    return next();
  } catch (e) {
    console.log('error: ', e);
    if (e === Service.SocialConnect.Invest.TwoFaCodeEnableErr) {
      return next(PopulateResponse.error(
        {
          message: 'User is enabled two-factor authentication'
        },
        'ERR_TWOFAAUTH_ENABLED',
        4003,
        200
      ));
    }

    return next(PopulateResponse.error(
      {
        message: e.message
      },
      'ERR_USER_INVALID',
      400,
      400
    ));
  }
};

exports.investLoginCallBack = async (req, res, next) => {
  try{
    var encodeToken = req.body.accept;
    var token = encodeToken.toString().slice(0, encodeToken.length - parseInt(SECURITY_KEY));

    var currentUserData = await Service.SocialConnect.Invest.getUserMe(token);
    if(currentUserData)
      res.locals.login = await Service.SocialConnect.Invest.saveUserMe(req, currentUserData, token);

    return next();
  }catch(e){
    if (e === Service.SocialConnect.Invest.TwoFaCodeEnableErr) {
      return next(PopulateResponse.error(
        {
          message: 'User is enabled two-factor authentication'
        },
        'ERR_TWOFAAUTH_ENABLED',
        4003,
        200
      ));
    }

    console.log("ex:", e.message);
    return next(PopulateResponse.error(
      {
        message: e.message
      },
      'ERR_USER_INVALID',
      400,
      400
    ));
  }
}