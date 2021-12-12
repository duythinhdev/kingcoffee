const Joi = require('@hapi/joi');
const moment = require('moment');
const _ = require('lodash');
const { save } = require('nconf');

/**
 * Get promotionType object.
 */
exports.findOne = async(options) => {
    try {
        const promotionType = await DB.PromotionType.findById(options.id);
        if (!promotionType) {
            return new Error(PopulateResponse.notFound());
        }

        //Cập nhật trạng thái cho các promotion type được filter
        await this.updatePromotionTypeStatus({
            query: { _id: promotionType._id }
        });

        return promotionType;
    } catch (e) {
        throw e;
    }
}


/**
 * Create a new promotionType.
 */
exports.create = async(options) => {
    try {
        if (options.code) {
            const existPromotionType = await DB.PromotionType.findOne({ code: options.code, isDeleted: false });
            if (existPromotionType) {
                //throw new Error("Promotion type code must be unique!");
                throw new Error("Mã loại chương trình đã tồn tại");
            }
        } else {
            //throw new Error("Promotion type code must not be empty!");
            throw new Error("Mã loại chương trình không được để trống");
        }

        options.startDate = new moment.utc(options.startDate, 'HH:mm DD-MM-YYYY');
        options.endDate = new moment.utc(options.endDate, 'HH:mm DD-MM-YYYY');

        if (options.startDate._d.getTime() > options.endDate._d.getTime()) {
            throw new Error("startDate must be little or equal endDate");
        }

        if (options.isDisplayHomePage) {
            const existDisplayHomePage = await DB.PromotionType.find({
                status: { $in: [Enums.PromotionEnums.PromotionTypeStatus.New.value, Enums.PromotionEnums.PromotionTypeStatus.Running.value] },
                isDisplayHomePage: true,
                isDeleted: false
            });

            if (!_.isEmpty(existDisplayHomePage)) {
                throw new Error("Promotion type display homepage is exist !");
            }
        }

        // if(options.isPriority){
        //   const existPriority = await DB.PromotionType.findOne(
        //     {
        //       $or: [
        //         { $and: [{ startDate: { $lte: options.startDate }}, { endDate: { $gte: options.endDate }}] },
        //         { $and: [{ startDate: { $lte: options.startDate }}, { endDate: { $gte: options.startDate }}] },
        //         { $and: [{ startDate: { $lte: options.endDate }}, { endDate: { $gte: options.endDate }}] },
        //         { $and: [{ startDate: { $gte: options.startDate}}, { endDate: {$lte: options.endDate}}] }
        //       ],
        //       isDeleted: false,
        //       isPriority: true,
        //       status: { $not: {
        //         $in:[
        //           Enums.PromotionEnums.PromotionTypeStatus.Finish.value,
        //           Enums.PromotionEnums.PromotionTypeStatus.Stop.value
        //         ]}
        //       }
        //     }
        //   )

        //   if(existPriority){
        //     //throw new Error(`${existPriority.name} is priority promotion type in this range date!`);
        //     throw new Error(`Đã tồn tại loại chương trình ưu tiên trong khoảng ngày hiện tại (${existPriority.code} - ${existPriority.name})`);
        //   }
        // }

        // if(!options.isPriority && !options.ordering){
        //   //throw new Error("Ordering is required if it isn\'t priority");
        //   throw new Error("Bắt buộc nhập số thứ tự nếu không chọn ưu tiên");
        // }

        // if(options.isPriority && options.ordering){
        //   //throw new Error("Ordering is required if it isn\'t priority");
        //   throw new Error("Không được thêm số thứ tự nếu đã chọn ưu tiên");
        // }

        // if(options.ordering){
        //   const maxOrderingList = await DB.PromotionType.find(
        //     {
        //       $or: [
        //         { $and: [{ startDate: { $lte: options.startDate }}, { endDate: { $gte: options.endDate }}] },
        //         { $and: [{ startDate: { $lte: options.startDate }}, { endDate: { $gte: options.startDate }}] },
        //         { $and: [{ startDate: { $lte: options.endDate }}, { endDate: { $gte: options.endDate }}] },
        //         { $and: [{ startDate: { $gte: options.startDate}}, { endDate: {$lte: options.endDate}}] }
        //       ],
        //       isDeleted: false,
        //       status: { $not: {
        //         $in:[
        //           Enums.PromotionEnums.PromotionTypeStatus.Finish.value,
        //           Enums.PromotionEnums.PromotionTypeStatus.Stop.value
        //         ]}
        //       }
        //     }
        //   ).sort({ordering: -1});

        //   if((maxOrderingList && maxOrderingList.length > 0 && maxOrderingList[0].ordering + 1 !== options.ordering) || (!maxOrderingList[0] && options.ordering > 1)){
        //     //throw new Error(`Max ordering current is ${maxOrdering[0].maxOrdering ? maxOrdering[0].maxOrdering : 0}!`);
        //     throw new Error(`Số thứ tự chưa có ${maxOrderingList[0] ? maxOrderingList[0].ordering + 1 : 1}!`);
        //   }
        // }

        const promotionType = new DB.PromotionType(options);
        await promotionType.save();

        return;
    } catch (e) {
        throw e;
    }
};

/**
 * Update for promotionType
 */
exports.update = async(options) => {
    try {
        let promotionType = await DB.PromotionType.findById(options.id);

        if (promotionType && !promotionType.isDeleted) {
            if (promotionType.code) {
                const existPromotionType = await DB.PromotionType.findOne({ code: options.code, isDeleted: false });
                if (existPromotionType && existPromotionType._id.toString() != promotionType._id.toString()) {
                    //throw new Error("Promotion type code must be unique!");
                    throw new Error("Mã loại chương trình đã tồn tại");
                }
            } else {
                //throw new Error("Promotion type code must not be empty!");
                throw new Error("Mã loại chương trình không được để trống");
            }

            options.startDate = new moment.utc(options.startDate, 'HH:mm DD-MM-YYYY');
            options.endDate = new moment.utc(options.endDate, 'HH:mm DD-MM-YYYY');

            if (options.startDate._d.getTime() > options.endDate._d.getTime()) {
                throw new Error("startDate must be little or equal endDate");
            }

            if (options.startDate._d.getTime() != promotionType.startDate.getTime() || options.endDate._d.getTime() != promotionType.endDate.getTime()) {
                const existPromotionOutSide = await DB.Promotion.findOne({
                    promotionTypeId: promotionType._id,
                    $nor: [
                        { $and: [{ startDate: { $lte: options.startDate } }, { endDate: { $gte: options.endDate } }] },
                        { $and: [{ startDate: { $lte: options.startDate } }, { endDate: { $gte: options.startDate } }] },
                        { $and: [{ startDate: { $lte: options.endDate } }, { endDate: { $gte: options.endDate } }] },
                        { $and: [{ startDate: { $gte: options.startDate } }, { endDate: { $lte: options.endDate } }] }
                    ],
                    isDeleted: false
                });

                if (existPromotionOutSide) {
                    //throw new Error(`Can\'t edit start date and end date because it have promotion outside new range date! (promotionCode: ${existPromotionOutSide.code})`);
                    throw new Error(`Tồn tại chương trình khuyến mãi nằm ngoài khoảng ngày bắt đầu và ngày kết thúc mới (mã chương trình: ${existPromotionOutSide.code})`);
                }
            }

            if (options.isDisplayHomePage) {
                const existDisplayHomePage = await DB.PromotionType.find({
                    _id: { $ne: promotionType._id },
                    status: { $in: [Enums.PromotionEnums.PromotionTypeStatus.New.value, Enums.PromotionEnums.PromotionTypeStatus.Running.value] },
                    isDisplayHomePage: true,
                    isDeleted: false
                });

                if (!_.isEmpty(existDisplayHomePage)) {
                    throw new Error("Promotion type display homepage is exist !");
                }
            }

            // if(options.isPriority){
            //   const existPriority = await DB.PromotionType.findOne(
            //     {
            //       $or: [
            //         { $and: [{ startDate: { $lte: options.startDate }}, { endDate: { $gte: options.endDate }}] },
            //         { $and: [{ startDate: { $lte: options.startDate }}, { endDate: { $gte: options.startDate }}] },
            //         { $and: [{ startDate: { $lte: options.endDate }}, { endDate: { $gte: options.endDate }}] },
            //         { $and: [{ startDate: { $gte: options.startDate}}, { endDate: {$lte: options.endDate}}] }
            //       ],
            //       isDeleted: false,
            //       isPriority: true,
            //       status: { $not: {
            //         $in:[
            //           Enums.PromotionEnums.PromotionTypeStatus.Finish.value,
            //           Enums.PromotionEnums.PromotionTypeStatus.Stop.value
            //         ]}
            //       }
            //     }
            //   )

            //   if(existPriority && existPriority._id.toString() != promotionType._id.toString()){
            //     //throw new Error(`${existPriority.name} is priority promotion type in this range date!`);
            //     throw new Error(`Đã tồn tại loại chương trình ưu tiên trong khoảng ngày hiện tại (${existPriority.code} - ${existPriority.name})`);
            //   }
            // }

            // if(!options.isPriority && !options.ordering){
            //   // throw new Error("Ordering is required if it isn\'t priority");
            //   throw new Error("Bắt buộc nhập số thứ tự nếu không chọn ưu tiên");
            // }

            // if(options.isPriority && options.ordering){
            //   //throw new Error("Ordering is required if it isn\'t priority");
            //   throw new Error("Không được thêm số thứ tự nếu đã chọn ưu tiên");
            // }

            // if(options.ordering && promotionType.ordering !== options.ordering && !options.isPriority){
            //   const maxOrderingList = await DB.PromotionType.find(
            //     {
            //       $or: [
            //         { $and: [{ startDate: { $lte: options.startDate }}, { endDate: { $gte: options.endDate }}] },
            //         { $and: [{ startDate: { $lte: options.startDate }}, { endDate: { $gte: options.startDate }}] },
            //         { $and: [{ startDate: { $lte: options.endDate }}, { endDate: { $gte: options.endDate }}] },
            //         { $and: [{ startDate: { $gte: options.startDate}}, { endDate: {$lte: options.endDate}}] }
            //       ],
            //       isDeleted: false,
            //       status: { $not: {
            //         $in:[
            //           Enums.PromotionEnums.PromotionTypeStatus.Finish.value,
            //           Enums.PromotionEnums.PromotionTypeStatus.Stop.value
            //         ]}
            //       }
            //     }
            //   ).sort({ordering: -1});

            //   if(promotionType.isPriority){
            //     if((maxOrderingList && maxOrderingList.length > 0 &&  maxOrderingList[0].ordering + 1 !== options.ordering) || (!maxOrderingList[0] && options.ordering > 1)){
            //       //throw new Error(`Max ordering current is ${maxOrdering[0].maxOrdering ? maxOrdering[0].maxOrdering : 0}!`);
            //       throw new Error(`Số thứ tự chưa có ${maxOrderingList[0] ? maxOrderingList[0].ordering + 1 : 1}!`);
            //     }
            //   }
            //   else {
            //     if((maxOrderingList && maxOrderingList.length > 0 &&  maxOrderingList[0].ordering < options.ordering) || (!maxOrderingList[0] && options.ordering > 1)){
            //       throw new Error(`Không được chọn số thứ tự lớn hơn ${maxOrderingList[0] ? maxOrderingList[0].ordering : 1}!`);
            //     }

            //     //Đổi chỗ với promotion Type có số thứ tự nhỏ hơn
            //     const swap = await maxOrderingList.find(x => x.ordering === options.ordering);
            //     if(swap){
            //       swap.ordering = promotionType.ordering;
            //       await swap.save();
            //     }
            //   }
            // }

            promotionType.code = options.code;
            promotionType.name = options.name;
            promotionType.description = options.description;
            promotionType.startDate = options.startDate;
            promotionType.endDate = options.endDate;
            promotionType.isActive = options.isActive;
            promotionType.isDisplayHomePage = options.isDisplayHomePage;
            //promotionType.ordering = options.ordering;
            //promotionType.isPriority = options.isPriority;      
        } else {
            throw new Error(PopulateResponse.notFound());
        }

        return await promotionType.save();

    } catch (e) {
        throw e;
    }
};

/**
 * Remove for promotionType
 */
exports.remove = async(options) => {
    try {
        const promotionType = await DB.PromotionType.findById(options.id);

        if (promotionType) {
            promotionType.isDeleted = true;
            return await promotionType.save();
        } else {
            throw new Error("Promotion type isn't found!");
        }

    } catch (e) {
        throw e;
    }
};

/**
 * get list Promotion Type
 */
exports.list = async(options) => {
    const page = Math.max(0, options.page - 1) || 0; // using a zero-based page index for use with skip()
    const take = parseInt(options.take, 10) || 10;
    try {
        const query = Helper.App.populateDbQuery(options, {
            text: ['code', 'name'],
        });

        if (options.status) {
            query.status = options.status;
        }

        if (options.isActive == true || options.isActive == false)
            query.isActive = options.isActive;

        if (options.startDate) {
            query.startDate = { $gte: new moment.utc(options.startDate, 'HH:mm DD-MM-YYYY') }
        }

        if (options.endDate) {
            query.endDate = { $lte: new moment.utc(options.endDate, 'HH:mm DD-MM-YYYY') }
        }

        query.isDeleted = false;

        //Cập nhật trạng thái cho các promotion type được filter
        await this.updatePromotionTypeStatus({
            query,
            take,
            page
        });

        const sort = Helper.App.populateDBSort(options);
        const count = await DB.PromotionType.countDocuments(query);
        const items = await DB.PromotionType.find(query)
            .collation({ locale: 'vi' })
            .sort(sort)
            .skip(page * take)
            .limit(take)
            .exec();

        return {
            count,
            items
        };
    } catch (e) {
        throw e;
    }
};

exports.updatePromotionTypeStatus = async(options) => {
    try {
        let _options = _.cloneDeep(options);
        const now = moment.utc();
        let promotionTypes = [];

        if (!_options || !_options && !_options.query) {
            _options.query = {};
        }

        _options.query.status = {
            $not: {
                $in: [
                    Enums.PromotionEnums.PromotionTypeStatus.Finish.value,
                    Enums.PromotionEnums.PromotionTypeStatus.Stop.value
                ]
            }
        }

        _options.query.isActive = true;

        // options.query.startDate = { $lte: now };
        // options.query.endDate = { $gte: now }

        if (_options && _options.page && _options.take) {
            promotionTypes = await DB.PromotionType.find(_options.query)
                .skip(_options.page * _options.take)
                .limit(_options.take)
                .exec();
        }

        if (promotionTypes.length === 0) {
            promotionTypes = await DB.PromotionType.find(_options.query);
        }

        if (promotionTypes && promotionTypes.length > 0) {
            for (promotionType of promotionTypes) {
                if (promotionType) {
                    await Service.Promotion.updatePromotionStatus({ query: { promotionTypeId: promotionType._id } });
                    switch (promotionType.status) {
                        case Enums.PromotionEnums.PromotionTypeStatus.New.value:
                            if (promotionType.startDate.getTime() <= now._d.getTime() && now._d.getTime() <= promotionType.endDate.getTime()) {
                                // promotionType.status = Enums.PromotionEnums.PromotionTypeStatus.Running.value;
                                await DB.PromotionType.update({ _id: promotionType._id }, { status: Enums.PromotionEnums.PromotionTypeStatus.Running.value });
                            }
                            break;
                        case Enums.PromotionEnums.PromotionTypeStatus.Running.value:
                            if (promotionType.endDate.getTime() < now._d.getTime()) {
                                //promotionType.status = Enums.PromotionEnums.PromotionTypeStatus.Finish.value;
                                await DB.PromotionType.update({ _id: promotionType._id }, { status: Enums.PromotionEnums.PromotionTypeStatus.Finish.value });
                            }
                            break;
                    }
                }
            }
        }

    } catch (e) {
        throw e;
    }
}

exports.stopPromotionType = async(promotionTypeId) => {
    try {
        if (promotionTypeId) {
            const currentPromotionType = await DB.PromotionType.findById(promotionTypeId);
            if (currentPromotionType) {
                if (currentPromotionType.status === Enums.PromotionEnums.PromotionTypeStatus.Stop.value || currentPromotionType.status === Enums.PromotionEnums.PromotionTypeStatus.Finish.value) {
                    //throw new Error("promotion type has finished or stopped!");
                    throw new Error("Loại chương trình đã kết thúc hoặc ngừng hoạt động!");
                } else {

                    //Cập nhật trạng thái cho tất cả promotion thuộc promotion type
                    const promotionList = await DB.Promotion.find({ promotionTypeId });
                    if (promotionList && promotionList.length > 0) {
                        for (const promotion of promotionList) {
                            promotion.status = Enums.PromotionEnums.PromotionStatus.Stop.value;
                            await promotion.save();
                        }
                    }

                    currentPromotionType.status = Enums.PromotionEnums.PromotionTypeStatus.Stop.value;
                    await currentPromotionType.save();
                }
            } else {
                throw new Error(PopulateResponse.notFound());
            }
        } else {
            //throw new Error("promotion type ID is invalid!");
            throw new Error("ID loại chương trình khuyến mãi không hợp lệ!");
        }
    } catch (e) {
        throw e;
    }
}