exports.list = async (req, res, next) => {
  try {
    const resList = await Service.Sale.getSaleList(req.query);
    res.locals.list = resList;
    return next();
  } catch (e) {
    return next(e);
  }
};