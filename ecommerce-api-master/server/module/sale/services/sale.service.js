const moment = require('moment');

exports.getSaleList = async (options) => {
  try {
    const page = Math.max(0, options.page - 1) || 0; // using a zero-based page index for use with skip()
    const take = parseInt(options.take, 10) || 10;

    const query = Helper.App.populateDbQuery(options, {
      equal: ["orderCode"],
      text: ["_id"]
    });

    const filterMemberId =
      Helper.App.populateDbQuery(options, {
        equal: ["memberId"]
      }) || {};

    if (filterMemberId.memberId) {
      const user = await DB.User.findOne(
        {
          memberId: filterMemberId.memberId
        },
        {
          _id: 1
        }
      );
      if (user) {
        query.customerId = user._id;
      } else {
        query.customerId = null;
      }
    }

    if (options.startDate && options.endDate) {
      query.updatedAt = { $gte: moment(options.startDate).toDate(), $lte: moment(options.endDate).add(1, 'days').toDate() };
    }

    const sort = Helper.App.populateDBSort(options);

    query.orderStatus = 'successDelivered';
    const count = await DB.Order.countDocuments(query);
    let items = [];

    if (options.isGetAll === 'false') {
      items = await DB.Order.find(query)
        .populate({
          path: "details",
          populate: [{
            path: "product",
            populate: {
              path: "mainImage"
            }
          },
          {
            path: "promotions.promotion",
            model: "Promotion"
          }]
        })
        .populate("customer")
        .populate("transaction")
        .populate("promotions.promotionOrder")
        .collation({
          locale: "vi"
        })
        .sort(sort)
        .skip(page * take)
        .limit(take)
        .lean()
        .exec();
    } else {
      items = await DB.Order.find(query)
        .populate({
          path: "details",
          populate: [{
            path: "product",
            populate: {
              path: "mainImage"
            }
          },
          {
            path: "promotions.promotion",
            model: "Promotion"
          }]
        })
        .populate("customer")
        .populate("transaction")
        .populate("promotions.promotionOrder")
        .collation({
          locale: "vi"
        })
        .sort(sort)
        .lean()
        .exec();
    }

    const totals = await DB.Order.aggregate([{
      $match: query
    }, {
      $group: {
        _id: null,
        sumTotalPrice: { $sum: "$totalPrice" }
      }
    },
    {
      $project: {
        _id: 0,
        sumTotalPrice: 1,
      }
    }
    ]);

    const total = totals && totals.length > 0 ? totals[0].sumTotalPrice : 0

    return {
      count,
      items,
      total
    };
  } catch (e) {
    throw e;
  }
}
