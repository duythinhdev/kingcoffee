exports.search = async (req, res, next) => {
    try {
      var result = await Service.Inventory.getAllProduct(req.query);
      if(result){
        res.locals.search = result;
        return next();
      }
      
      return next(new Error("Can't get product list data!"));
    } catch (e) {
      console.log('err: ', e);
      return next(e);
    }
};

exports.tree = async (req, res, next) => {
    try {
        var tree = await Service.Inventory.getCategoriesTree(req.query);
        if(tree){
            res.locals.tree = tree;
            return next();
        }

        return next(new Error("Can't get data of categories!"));
    } catch (e) {
        next(e);
    }
};