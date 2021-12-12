exports.stats = async (req, res, next) => {
  try {
    const statuses = ['pending', 'progressing', 'shipping', 'completed', 'refunded', 'cancelled'];
    const promises = statuses.map((status) => {
      const query = {
        status,
        paymentStatus: 'Thành công',
        paymentMethod: 'Ví GoldTime'
      };
      if (!req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) || req.headers.platform !== 'admin') {
        query.shopId = req.user.shopId;
      } else if (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) && req.query.shopId) {
        query.shopId = req.query.shopId;
      }
      return DB.OrderDetail.countDocuments(query)
        .then(count => ({ count, status }));
    });

    const data = await Promise.all(promises);
    const result = {};
    let count = 0;
    console.log(data)
    data.forEach((item) => {
      count += item.count;
      result[item.status] = item.count;
    });
    result.all = count;
    // count total if user is admin
    if (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      result.totalParentOrder = await DB.Order.countDocuments({
        paymentStatus: 'Hoàn thành',
        paymentMethod: 'Ví GoldTime'
      });
    }

    res.locals.stats = result;
    next();
  } catch (e) {
    next(e);
  }
};

exports.saleStats = async (req, res, next) => {
  try {
    const query = {
      paymentStatus: 'Thành công',
      paymentMethod: 'Ví GoldTime',
      // status: 'completed'
    };
    if (!req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) || req.headers.platform !== 'admin') {
      query.shopId = req.user.shopId;
    } else if (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) && req.query.shopId && Helper.App.isMongoId(req.query.shopId)) {
      query.shopId = Helper.App.toObjectId(req.query.shopId);
    }
    const data = await DB.OrderDetail.aggregate([{
      $match: query
    }, {
      $group: {
        _id: null,
        priceReceiverAdmin: {$sum: '$priceReceiverAdmin'},
        balance: { $sum: '$balance' },
        commission: { $sum: '$commission' },
        totalPrice: { $sum: '$totalPrice' },
        taxPrice: { $sum: '$taxPrice' },
        totalProduct: { $sum: '$quantity' },
        totalOrder: { $sum: 1 }
      }
    }]);
    const result = {
      priceReceiverAdmin: 0,
      balance: 0,
      commission: 0,
      totalPrice: 0,
      taxPrice: 0,
      totalProduct: 0,
      totalOrder: 0
    };
    if (data && data.length) {
      result.priceReceiverAdmin = data[0].priceReceiverAdmin;
      result.balance = data[0].balance;
      result.commission = data[0].commission;
      result.totalPrice = data[0].totalPrice;
      result.taxPrice = data[0].taxPrice;
      result.totalProduct = data[0].totalProduct;
      result.totalOrder = data[0].totalOrder;
    }

    res.locals.saleStats = result;
    next();
  } catch (e) {
    next(e);
  }
};
