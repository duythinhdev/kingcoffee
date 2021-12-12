const moment = require("moment");
const { forEach } = require("lodash");

exports.insertMonthKPI = async date => {
  try {
    if (date) {
      const firstDateOfPrevMonth = new Date(
        Date.UTC(date.getFullYear(), date.getMonth() - 1, 1)
      );
      const lastDateOfPrevMonth = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), 0)
      );

      //console.log("firstDateOfPrevMonth", firstDateOfPrevMonth);
      //console.log("lastDateOfPrevMonth", lastDateOfPrevMonth);

      const userList = await DB.User.find({
        $or: [
          {
            userRoles: {
              $elemMatch: {
                Role: Enums.UserEnums.UserRole.WE.value
              }
            }
          },
          {
            userRoles: {
              $elemMatch: {
                Role: Enums.UserEnums.UserRole.WE_HOME.value
              }
            }
          }
        ]
      });

      const existKPI = await DB.KPI.findOne({
        month: { $gte: firstDateOfPrevMonth, $lte: lastDateOfPrevMonth }
      });
      if (existKPI) return;

      //Lấy thông tin từ KPI config để tính toán KPI cho từng WE
      const kpiConfig = await DB.Config.findOne({
        key: "kpiConfig"
      });

      if (kpiConfig) {
        if (userList && userList.length > 0) {
          for (let i = 0; i < userList.length; i++) {
            const user = userList[i];
            if (user) {
              // const existKPI = await DB.KPI.findOne({userId: user._id, month: {$gte: firstDateOfPrevMonth, $lte: lastDateOfPrevMonth}});
              // if(existKPI)
              //   continue;

              let item = await DB.Transaction.aggregate([
                {
                  $match: {
                    userId: user._id,
                    updatedAt: {
                      $gte: firstDateOfPrevMonth,
                      $lte: lastDateOfPrevMonth
                    },
                    status: "success",
                    type: "order"
                  }
                },
                {
                  $group: {
                    _id: user._id,
                    totalPayment: {
                      $sum: "$totalPrice"
                    }
                  }
                }
              ]);
              //console.log("item", item);
              var valuePercent = 0;
              if (item && item.length > 0) {
                kpiConfig.value.kpiMonth.forEach(x => {
                  if (x.level < item[0].totalPayment)
                    valuePercent = x.valuePercent;
                });

                if (valuePercent) {
                  const kpi = new DB.KPI({
                    userId: item[0]._id,
                    //customerCode: user.memberId,
                    totalPriceMonth: item[0].totalPayment,
                    valuePercent,
                    month: firstDateOfPrevMonth
                  });

                  kpi.kpiMonth = (kpi.valuePercent * kpi.totalPriceMonth) / 100;

                  //Tính thưởng KPI cho 3 tháng liên tục
                  const firstDateOfThreeMonthAgo = new Date(
                    Date.UTC(
                      firstDateOfPrevMonth.getFullYear(),
                      firstDateOfPrevMonth.getMonth() - 2,
                      1
                    )
                  );
                  const continuousThreeMonthKPI = await DB.KPI.find({
                    month: {
                      $lte: date,
                      $gte: firstDateOfThreeMonthAgo
                    },
                    userId: item[0]._id
                  });
                  if (
                    continuousThreeMonthKPI &&
                    continuousThreeMonthKPI.length === 2 &&
                    !continuousThreeMonthKPI.find(
                      x => x.kpiReward && x.kpiReward > 0
                    )
                  ) {
                    const totalPriceOfThreeMonth =
                      continuousThreeMonthKPI.reduce(
                        (total, e) => total.totalPriceMonth + e.totalPriceMonth
                      ) + kpi.totalPriceMonth;
                    kpi.kpiReward =
                      (totalPriceOfThreeMonth * kpiConfig.value.kpiReward) /
                      100;
                  }

                  await kpi.save();
                }
              }
            }
          }
        }
      } else {
        throw new Error(
          "System not found KPI config, please import it before continue!"
        );
      }
    }
  } catch (e) {
    throw e;
  }
};

exports.getKPIList = async (options, user) => {
  try {
    const page = Math.max(0, options.page - 1) || 0; // using a zero-based page index for use with skip()
    const take = parseInt(options.take, 10) || 10;

    let query = {};

    if (options.startMonth) {
      let dStartDate = moment(options.startMonth, "MM-YYYY").toDate();
      let dEndDate = moment(options.startMonth, "MM-YYYY")
        .add(1, "months")
        .toDate();

      if (options.endMonth) {
        dEndDate = moment(options.endMonth, "MM-YYYY")
          .add(1, "months")
          .toDate();
      }

      query.month = {
        $gte: dStartDate,
        $lt: dEndDate
      };
    }

    const filterMemberId =
      Helper.App.populateDbQuery(options, {
        equal: ["memberId"]
      }) || {};

    const sort = Helper.App.populateDBSort(options);

    if (
      user.userRoles.find(
        x => x.Role === Enums.UserEnums.UserRole.Admin.value
      ) &&
      filterMemberId.memberId
    ) {
      const user = await DB.User.findOne(
        {
          memberId: filterMemberId.memberId
        },
        {
          _id: 1
        }
      );
      if (user) {
        query.userId = user._id;
      } else {
        query.userId = null;
      }
    } else if (
      !user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)
    ) {
      const userSocial = await Service.User.GetInvestUserId(user._id);
      let urlCheckInvest = null;
      if (filterMemberId.memberId) {
        urlCheckInvest = `${process.env.INVEST_API}/api/v1/Account/checks?customerNumber=${filterMemberId.memberId}`;
      } else {
        urlCheckInvest = `${process.env.INVEST_API}/api/v1/Account/checks`;
      }

      const checkDownlineInvest = await Service.KPIs.checkDownlineUser(
        userSocial.accessToken,
        urlCheckInvest
      );
      console.log("checkDownlineInvest", checkDownlineInvest);
      if (checkDownlineInvest.StatusCode === 200) {
        if (checkDownlineInvest.listCustomerNumber) {
          // checkDownlineInvest.listCustomerNumber là list memberId dưới cấp của user này.
          let listUserId = await DB.User.find({
            memberId: { $in: checkDownlineInvest.listCustomerNumber }
          }).select("_id");
          // add memberId của user này.
          // if(!filterMemberId.memberId){
          //   var currentUserId = {_id: user._id}
          //   listUserId.push(currentUserId);
          // }

          listUserIdFinal = listUserId.map(x => {
            return Helper.App.toObjectId(x._id);
          });
          query.userId = { $in: listUserIdFinal };
        } else {
          const userQuery = await DB.User.findOne({
            memberId: filterMemberId.memberId
          }).select("_id");
          query.userId = Helper.App.toObjectId(userQuery._id);
        }
      } else {
        if (filterMemberId.memberId === user.memberId) {
          query.userId = user._id;
        } else {
          query.userId = null;
        }
      }
    }

    const count = await DB.KPI.countDocuments(query);
    // const listItem = await DB.KPI.find(query)
    // .populate("user")
    // .collation({
    //   locale: "vi"
    // })
    // .skip(page * take)
    // .limit(take);

    // let items = [];

    // for(var i = 0; i < listItem.length; i++){
    //   let item = {};
    //   item.userId = listItem[i].userId,
    //   item.user = listItem[i].user,
    //   item.totalPriceMonth = listItem[i].totalPriceMonth,
    //   item.valuePercent = listItem[i].valuePercent,
    //   item.kpiMonth = listItem[i].kpiMonth,
    //   item.kpiReward = listItem[i].kpiReward,
    //   item.createdAt = listItem[i].createdAt,
    //   item.updatedAt = listItem[i].updatedAt,
    //   item.month = moment(listItem[i].month).format('MM-YYYY');
    //   items.push(item);
    // }

    const items = await DB.KPI.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$userId",
          user: "$user",
          totalPriceMonth: "$totalPriceMonth",
          valuePercent: "$valuePercent",
          kpiMonth: "$kpiMonth",
          kpiReward: "$kpiReward",
          month: { $dateToString: { format: "%m-%Y", date: "$month" } },
          createdAt: "$createdAt",
          updatedAt: "$updatedAt"
        } //{userId: { '$in': [ '5fa29d2065f7760011b33cae', '5f7ef0079dc863001800bd5f' ] }}
      }
    ])
      .collation({
        locale: "vi"
      })
      .skip(page * take)
      .limit(take);

    const totals = await DB.KPI.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: null,
          totalKPIMonth: { $sum: "$kpiMonth" },
          totalKPIReward: { $sum: "$kpiReward" }
        }
      },
      {
        $project: {
          _id: 0,
          totalKPIMonth: 1,
          totalKPIReward: 1
        }
      }
    ]);

    const total =
      totals && totals.length > 0
        ? totals[0]
        : {
            totalKPIMonth: 0,
            totalKPIReward: 0
          };

    return {
      count,
      items,
      total
    };
  } catch (e) {
    throw e;
  }
};

exports.getCurrentKPIForThisMonth = async (date, user) => {
  try {
    const firstDateOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    //Lấy thông tin từ KPI config để tính toán KPI cho từng WE
    const kpiConfig = await DB.Config.findOne({
      key: "kpiConfig"
    });

    if (kpiConfig) {
      const payment = await DB.Transaction.aggregate([
        {
          $match: {
            userId: user._id,
            updatedAt: {
              $gte: firstDateOfMonth,
              $lte: date
            },
            status: "success",
            type: "order"
          }
        },
        {
          $group: {
            _id: user._id,
            totalPayment: {
              $sum: "$totalPrice"
            }
          }
        }
      ]);

      if (payment && payment.length > 0) {
        let valuePercent = 0;
        kpiConfig.value.kpiMonth.forEach(x => {
          if (x.level < payment[0].totalPayment) {
            valuePercent = x.valuePercent;
          }
        });

        return {
          totalPriceMonth: payment[0].totalPayment,
          valuePercent,
          kpiMonth: (payment[0].totalPayment * valuePercent) / 100,
          kpiPercent: Number(
            (payment[0].totalPayment / kpiConfig.value.kpiMonth[0].level) * 100
          ).toFixed(2)
        };
      } else {
        return {
          totalPriceMonth: 0,
          valuePercent: 0,
          kpiMonth: 0,
          kpiPercent: 0
        };
      }
    } else {
      throw new Error(
        "System not found KPI config, please import it before continue!"
      );
    }
  } catch (e) {
    throw e;
  }
};
