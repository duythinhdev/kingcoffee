
exports.stats = async (req, res, next) => {
  try {
    const query = {};
    if (!req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) || req.headers.platform !== 'admin') {
      query.shopId = req.user.shopId;
    }
    const total = await DB.Product.countDocuments(query);

    res.locals.stats = { total };
    next();
  } catch (e) {
    next(e);
  }
};
