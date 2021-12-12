const moment = require("moment");

exports.totalPriceCheckoutByDate = async (options) => {
    try {
        const dStartDate = moment(options.startDate,'DD-MM-YYYY').toDate();
        const dEndDate = moment(options.endDate, 'DD-MM-YYYY').add(1, 'days').toDate();

        const userList = await DB.User.find({
            $or: [
                {userRoles: {$elemMatch: {Role: Enums.UserEnums.UserRole.WE.value}}},
                {userRoles: {$elemMatch: {Role: Enums.UserEnums.UserRole.WE_HOME.value}}}
            ]
        });

        let statisticList = [];
        if(userList && userList.length > 0){
            for(let i = 0; i < userList.length; i++){
                const user = userList[i];
                if(user){
                    const social = await DB.UserSocial.findOne({userId: user._id}).select('socialId');
                    if(social){
                        let item = await DB.Transaction.aggregate([
                            { $match: {
                                userId: user._id,
                                updatedAt: { $gte: dStartDate, $lte: dEndDate},
                                status: 'success',
                                type: 'order'
                            }},
                            { $group: {
                                _id: user._id,
                                totalPayment: { $sum: "$totalPrice" }
                            }}
                        ]);
        
                        if(item && item.length > 0){
                            item[0].userId = social.socialId;
                            statisticList.push(item[0]);
                        }
                    }
                }
            }
        }
        
        return statisticList;
    } catch (error) {
      throw error;
    }
};