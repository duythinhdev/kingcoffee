const Joi = require('@hapi/joi');
const signToken = require('../auth.service').signToken;

exports.login = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      deviceId: Joi.string().required(),
      accessToken: Joi.string().required()
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const data = await Service.SocialConnect.Google.getProfile(validate.value.accessToken);
    let email = data.email;

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
        Name: data.sub + '_google',
        Mobile: '',
        PassWord: "",
        ConfirmPassword: "",
        Email: email
    };

    let investToken;
    if (!user) {
      user = new DB.User({
        email: email,
        username: data.sub + `_google`,
        provider: 'google',
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
        user.username ? user.username : data.sub + '_google',
        '',
        null,
        validate.value.deviceId
      );
      investToken = loginInvestToken;
      var currentUserData = await Service.SocialConnect.Invest.getUserMe(loginInvestToken);
      res.locals.login = await Service.SocialConnect.Invest.saveUserMe(req, currentUserData, loginInvestToken);
    }

    user = await DB.User.findOne({ providerId: data.sub });
    const social = await DB.UserSocial.findOne({
      userId: user._id
    });
    social.social = 'google';
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
};
