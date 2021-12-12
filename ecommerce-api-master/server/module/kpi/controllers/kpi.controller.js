const moment = require("moment");

exports.insertMonthKPI = async (req, res, next) => {
    try {
      if(req.body.date){
        const date = moment(req.body.date,'DD-MM-YYYY').toDate();
        await Service.KPI.insertMonthKPI(date);
        return next(PopulateResponse.success(null, "Insert KPI for previous month is successful!"));
      }else{
        return next(new Error("Date invalid!"))
      }
    } catch (e) {
      return next(e);
    }
};

exports.list = async (req, res, next) => {
    try {
      const listRes = await Service.KPI.getKPIList(req.query, req.user);
      res.locals.list = listRes;
      return next();
    } catch (e) {
      return next(e);
    }
};

exports.currentKPI = async (req, res, next) => {
  try {
    const currentKPI = await Service.KPI.getCurrentKPIForThisMonth(new Date(), req.user);
    res.locals.kpi = currentKPI;
    return next();
  } catch (e) {
    return next(e);
  }
};