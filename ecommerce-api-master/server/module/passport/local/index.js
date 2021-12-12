const passport = require('passport');
const EXPIRE_TOKEN_DURATION = process.env.EXPIRE_TOKEN_DURATION || 31536000;
const signToken = require('../auth.service').signToken;

exports.login = async (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    try {
      const error = err || info;
      if (error) {
        return next(error);
      }
      if (!user) {
        return next(PopulateResponse.notFound());
      }

      // if shop is deactivated, disable login!
      if (req.headers.platform === 'seller') {
        if (!user.isShop || !user.shopId) {
          return next(PopulateResponse.error({
            message: "Your account hasn't regsistered for shop!"
          }));
        }
        // const allowShop = await DB.Shop.countDocuments({
        //   _id: user.shopId,
        //   activated: true
        // });
        // if (!allowShop) {
        //   return next(PopulateResponse.error({
        //     message: 'Shop is deactivated!'
        //   }));
        // }
      }

      const expireTokenDuration = parseInt(EXPIRE_TOKEN_DURATION); // 365 days = 60 * 60 * 1 * 24 * 365 = 31536000
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
  })(req, res, next);
};
