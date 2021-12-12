const Joi = require('@hapi/joi');
const signToken = require('../auth.service').signToken;

exports.login = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
        //special
        deviceId: Joi.string().allow(null, '').required(),
        email: Joi.string().allow(null, '').required(),
        state: Joi.string().allow(null, '').required(),
        authorizationCode: Joi.string().required(),
        identityToken: Joi.string().required(),
        fullName: Joi.object().keys({
            nickname: Joi.string().allow(null, '').required(),
            phoneticRepresentation: Joi.object().allow(null).required(),
            middleName: Joi.string().allow(null, '').required(),
            familyName: Joi.string().allow(null, '').required(),
            namePrefix: Joi.string().allow(null, '').required(),
            givenName: Joi.string().allow(null, '').required(),
            nameSuffix: Joi.string().allow(null, '').required()
        }),
        user: Joi.string().required()
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
        return next(PopulateResponse.validationError(validate.error));
    }

    const data = await Service.SocialConnect.Apple.getProfile(validate.value);
    let email = data.email;
    if (email && data.emails) {
      email = data.emails[0].value;
    }

    let user;
    if (email) {
      user = await DB.User.findOne({ email: email });
    }
    if (!user) {
      user = await DB.User.findOne({ providerId: data.sub });
    }
    let isNew = false;

    const registerParams = {
      BusinessForm: [
        { Name: 0, Value: 1 },
        { Name: 3, Value: 1 },
        { Name:5, Value:1 }
      ],
      CompanyType: 0,
      CompanyName: "",
      Name: data.sub + '_apple',
      Mobile: '',
      PassWord: '',
      ConfirmPassword: '',
      Email: email
    };

    let investToken;
    if (!user) {
      user = new DB.User({
        email,
        username: data.sub + '_apple',
        provider: 'apple',
        providerId: data.sub
      });
      await user.save();

      await Service.SocialConnect.Invest.registerUserFromSocial(registerParams);
      const loginInvestToken = await Service.SocialConnect.Invest.crossLoginSocial(
        registerParams.Name,
        registerParams.PassWord,
        null,
        validate.value.deviceId
      );
      investToken = loginInvestToken;
      var currentUserData = await Service.SocialConnect.Invest.getUserMe(loginInvestToken);
      res.locals.login = await Service.SocialConnect.Invest.saveUserMe(req, currentUserData, loginInvestToken);
      isNew = true;
    } else {
      if (!user.providerId) {
        user.providerId = data.sub;
        await user.save();
      }
      const loginInvestToken = await Service.SocialConnect.Invest.crossLoginSocial(
        user.username ? user.username : data.sub + '_apple',
        '',
        null,
        validate.value.deviceId
      );
      investToken = loginInvestToken;
      var currentUserData = await Service.SocialConnect.Invest.getUserMe(loginInvestToken);
      res.locals.login = await Service.SocialConnect.Invest.saveUserMe(req, currentUserData, loginInvestToken);
    }

    user = await DB.User.findOne({ providerId: data.sub });
    let social;
    social = await DB.UserSocial.findOne({
      userId: user._id
    });
    social.social = 'apple';
    social.accessToken = investToken;
    social.socialData = data;
    await social.save();

    const expireTokenDuration = 60 * 60 * 24 * 7; // 7 days
    const now = new Date();
    const expiredAt = new Date(now.getTime() + (expireTokenDuration * 1000));
    const token = signToken(user._id, user.userRoles, expireTokenDuration);

     res.locals.login = {
      token,
      expiredAt
    };

    return next();
  } catch (e) {
    return next(e);
  }
}