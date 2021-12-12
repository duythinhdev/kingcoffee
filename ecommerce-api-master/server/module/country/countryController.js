exports.getCountries = async (req, res, next) => {
  try {
    res.locals.countries = await DB.Country.find();
    next();
  } catch (e) {
    next(e);
  }
};

exports.getStates = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.country) {
      if (Helper.App.isMongoId(req.query.country)) {
        query.countryId = req.query.country;
      } else {
        query.countryCode = req.query.country;
      }
    }
    res.locals.states = await DB.State.find(query);
    next();
  } catch (e) {
    next(e);
  }
};

exports.getCities = async (req, res, next) => {
  try {
    if (req.query.state) {
      res.locals.cities = await DB.City.find({
        $or: [{
          stateId: req.query.state
        }]
      });
    } else {
      res.locals.cities = [];
    }

    next();
  } catch (e) {
    next(e);
  }
};

exports.getProvince = async (req, res, next) => {
  try {
    let AdministrativeDevisions = [];
    const type = req.query.type ? req.query.type : 'default';

    switch (type) {
      case 'ward':
        if (!req.query.id) {
          return next(PopulateResponse.error(null, 'id is required'));
        }
        AdministrativeDevisions = await Service.SocialConnect.Invest.getWard(req.query.id);
        break;

      case 'district':
        if (!req.query.id) {
          return next(PopulateResponse.error(null, 'id is required'));
        }
        AdministrativeDevisions = await Service.SocialConnect.Invest.getDistrict(req.query.id);
        break;

      case 'default':
        AdministrativeDevisions = await Service.SocialConnect.Invest.getProvince();
        break;

      default:
        break;
    }

    res.locals.advs = AdministrativeDevisions;
    next();
  } catch (e) {
    next(e);
  }
};
