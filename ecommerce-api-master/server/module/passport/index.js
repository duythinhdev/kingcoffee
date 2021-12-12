const compose = require('composable-middleware');
const jwt = require('jsonwebtoken');
const nconf = require('nconf');

function getDecoded(req) {
  let token;
  if (req.query && Object.prototype.hasOwnProperty.call(req.query, 'access_token')) {
    token = req.query.access_token;
    req.headers.authorization = `Bearer ${req.query.access_token}`;
    token = req.query.access_token;
  } else if (!req.headers.authorization) {
    return null;
  } else {
    const tokenSplit = req.headers.authorization.split(' ');
    if (tokenSplit.length !== 2) { return null; }

    token = tokenSplit[1];
  }

  try {
    return jwt.verify(token, process.env.SESSION_SECRET);
  } catch (e) {
    return null;
  }
}

async function isAuthenticated(req, res, next) {
  try {
    const decoded = getDecoded(req);
    if (!decoded) {
      return next(PopulateResponse.unauthenticated());
    }

    // sync user/me from invest
    const socialUser = await DB.UserSocial.findOne({
        userId: decoded._id,
    },null, {sort: {createdAt: -1 }});

    if(socialUser){
      var currentUserData = await Service.SocialConnect.Invest.getUserMe(socialUser.accessToken);
      var updateUserMe = await Service.SocialConnect.Invest.saveUserMe(req, currentUserData, socialUser.accessToken);
    }

    const user = await DB.User.findOne({
      _id: decoded._id,
      isActive: true
    });

    if (!user) {
      return next(PopulateResponse.unauthenticated());
    }

    req.user = user;
    return next();
  } catch (e) {
    return next(e);
  }
}

async function loadUser(req, res, next) {
  const decoded = getDecoded(req);
  if (decoded === null) {
    return next();
  }

  try {
    const user = await DB.User.findOne({
      _id: decoded._id,
      isActive: true
    });
    if (user) {
      req.user = user;
    }

    req.user = user;
    return next();
  } catch (e) {
    return next(e);
  }
}

async function checkPlatform(req, res, next) {
  try {
    // if shop is deactivated, disable login!
    if (req.headers.platform === 'seller') {
      if (!req.user.isShop || !req.user.shopId) {
        return next(PopulateResponse.error({
          message: 'Shop is deactivated!'
        }));
      }
      // const allowShop = await DB.Shop.countDocuments({
      //   _id: req.user.shopId,
      //   activated: true
      // });
      // if (!allowShop) {
      //   return next(PopulateResponse.error({
      //     message: 'Shop is deactivated!'
      //   }));
      // }
    }
    if(req.headers.platform === 'web'){
      return next(PopulateResponse.unauthenticated());
    }
    return next();
  } catch (e) {
    return next(e);
  }
}

async function checkApiKey(req, res, next) {
  try {
    var apiKey = req.headers["x-api-key"];
    if (!apiKey || (apiKey && apiKey !== process.env.APIKEY)) {
      return next(PopulateResponse.unauthenticated());
    }

    return next();
  } catch (e) {
    return next(e);
  }
}

exports.core = () => {
  require('./local/passport').setup();
};

exports.router = (router) => {
  require('./routes')(router);
};

exports.middleware = {
  isAuthenticated,
  loadUser,
  checkPlatform,
  checkApiKey,
  /**
   * Checks if the user role meets the minimum requirements of the routes
   */
  hasRole(roleRequired) {
    if (!roleRequired) {
      throw new Error('Required role needs to be set');
    }

    return compose()
      .use(isAuthenticated)
      .use((req, res, next) => {
        // const roles = nconf.get('roles');
        // if (roles.indexOf(req.user.role) >= roles.indexOf(roleRequired)) {
        //   return next();
        // }

        if (req.user.userRoles.find(x => x.RoleName.toLowerCase() === roleRequired.toLowerCase())) {
          return next();
        }

        return next(PopulateResponse.forbidden());
      });
  }
};
