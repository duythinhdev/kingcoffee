exports.balance = async (req, res, next) => {
  try {
    const shopId = req.params.shopId || req.user.shopId;
    const data = await Service.PayoutRequest.calculateCurrentBalance(shopId);
    res.locals.balance = data;
    next();
  } catch (e) {
    next(e);
  }
};

exports.stats = async (req, res, next) => {
  try {
    const options = req.query;
    if (!req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      options.shopId = req.user.shopId;
    }

    res.locals.stats = await Service.PayoutRequest.stats(options);
    return next();
  } catch (e) {
    return next(e);
  }
};
