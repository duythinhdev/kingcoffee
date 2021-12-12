 /**
  * @ServiceName getAllProduct
  * @Description Get product list with options
  * @Param {Object}   [options]  include params under
  * @paramAttr {String}   [categoryId]
  * @paramAttr {String}   [shopId]
  * @paramAttr {String}   [q] search field
  * @paramAttr {String}   [type] category of products
  */
 exports.getAllProduct = async (options) => {
   try {
     let query = Helper.App.populateDbQuery(options, {
       text: ['name'],
       boolean: ['isActive', 'isDeleted']
     });

     if (options.categoryId) {
       // TODO - optimize me by check in the cache
       const categories = await DB.ProductCategory.find();
       const category = categories.find(item => ([item.alias, item._id.toString()].indexOf(options.categoryId)) > -1);
       if (category) {
         const tree = Helper.Utils.unflatten(categories.map(c => c.toJSON()));
         const root = Helper.Utils.findChildNode(tree, category._id);

         query.categoryId = {
           $in: !root ? [category._id] : Helper.Utils.flatten(root).map(item => item._id)
         };
       }
     }

     let defaultSort = true;
     // if (['seller', 'admin'].indexOf(req.headers.platform) === -1) {
     //   query.isActive = true;
     //   query.shopVerified = true;
     //   query.shopActivated = true;
     //   defaultSort = false;
     // } else if (req.headers.platform === 'seller' && req.user && req.user.isShop) {
     //   // from seller platform, just show seller products
     //   query.shopId = req.user.shopId;
     // }

     // if (req.headers.platform !== 'seller' && options.shopId) {
     //   query.shopId = Helper.App.toObjectId(options.shopId);
     // }

     if (options.q) {
       query.name = {
         $regex: options.q.trim(),
         $options: 'i'
       };
     }

     // if (query.dailyDeal && ['false', '0'].indexOf(query.dailyDeal) === -1) {
     //   query.dailyDeal = true;
     // }

     if (options.type) {
       query.type = options.type;
     }

     // const sort = Object.assign(Helper.App.populateDBSort(options), defaultSort ? {} : {
     //   shopFeatured: -1
     // });
     const count = await DB.Product.countDocuments(query);

     // if (options.sort === 'random') {
     //   const randomData = await DB.Product.aggregate([{
     //     $match: query
     //   }, {
     //     $sample: { size: take }
     //   }, {
     //     $project: { _id: 1 }
     //   }]);
     //   if (randomData && randomData.length) {
     //     query = {
     //       _id: {
     //         $in: randomData.map(p => p._id)
     //       }
     //     };
     //   }
     // }

     const items = await DB.Product.find(query)
       .populate({
         path: 'mainImage',
         select: '_id filePath mediumPath thumbPath uploaded type'
       })
       .populate({
         path: 'category',
         select: '_id name mainImage totalProduct parentId'
       })
       .populate('shop')
       .collation({
         locale: 'en'
       })
       // .sort(sort)
       .exec();

     return {
       count,
       items
     };
   } catch (e) {
     throw e;
   }
 }

 /**
  * @ServiceName getCategoriesTree
  * @Description Get all catgories with tree form
  * @Param {Object}   [options]  include params under
  * @paramAttr {String}   [name]
  * @paramAttr {Boolean}   [isActive]
  * @paramAttr {Boolean}   [isDeleted]
  */
 exports.getCategoriesTree = async (options) => {
   try {
     let query = Helper.App.populateDbQuery(options, {
       text: ['name'],
       boolean: ['isActive', 'isDeleted']
     });

     const categories = await DB.ProductCategory.find(query)
       .populate({
         path: 'mainImage',
         select: '_id filePath mediumPath thumbPath uploaded type'
       })
       .sort({
         ordering: -1
       });
     return Helper.Utils.unflatten(categories.map(c => c.toJSON()));
   } catch (e) {
     throw e;
   }
 }