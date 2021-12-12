/* eslint no-restricted-syntax: 0, no-await-in-loop: 0, no-param-reassign: 0, no-continue: 0 */
const _ = require("lodash");
const csv = require("csvtojson");
const moment = require("moment");
const request = require("request");
const { userInfo } = require("os");

const lowQuantityNumber = parseInt(process.env.LOW_QUALITY_QUANTITY, 10) || 1;

exports.updateQuantity = async ({ productId, productVariantId, quantity }) => {
  try {
    let sendEmailLowStock = false;
    let sendEmailSoldOut = false;
    const product = await DB.Product.findOne({ _id: productId });
    if (!product) {
      throw new Error("Product not found!");
    }
    const productVariant = productVariantId
      ? await DB.ProductVariant.findOne({ _id: productVariantId })
      : null;
    if (productVariant && productVariant.stockQuantity > 0) {
      let stockQuantity = productVariant.stockQuantity - quantity;
      if (stockQuantity < 0) {
        stockQuantity = 0;
      }

      if (stockQuantity === 0) {
        sendEmailSoldOut = true;
      } else if (stockQuantity <= lowQuantityNumber) {
        sendEmailLowStock = true;
      }
      productVariant.stockQuantity = stockQuantity;
      await productVariant.save();
    } else if (!productVariant) {
      let stockQuantity = product.stockQuantity - quantity;
      if (stockQuantity < 0) {
        stockQuantity = 0;
      }

      if (stockQuantity === 0) {
        sendEmailSoldOut = true;
      } else if (stockQuantity <= lowQuantityNumber) {
        sendEmailLowStock = true;
      }
      product.stockQuantity = stockQuantity;
      await product.save();
    }

    const data = {
      product: product.toObject(),
      productVariant: productVariant ? productVariant.toObject() : null
    };
    if (sendEmailLowStock) {
      await Service.Product.notifyLowStock(data);
    }
    if (sendEmailSoldOut) {
      await Service.Product.notifySoldOut(data);
    }
  } catch (e) {
    throw e;
  }
};

exports.notifyLowStock = async options => {
  try {
    const shop = await DB.Shop.findOne({ _id: options.product.shopId });
    if (!shop) {
      return;
    }

    if (shop.email) {
      Service.Mailer.send("product/low-stock-alert.html", shop.email, {
        subject: `Low stock product "${options.product.name}"`,
        product: options.product,
        productVariant: options.productVariant
      });
    }

    if (process.env.EMAIL_NOTIFICATION_LOW_STOCK) {
      Service.Mailer.send(
        "product/low-stock-alert.html",
        process.env.EMAIL_NOTIFICATION_LOW_STOCK,
        {
          subject: `Low stock product "${options.product.name}". Shop "${shop.name}"`,
          product: options.product,
          productVariant: options.productVariant
        }
      );
    }
  } catch (e) {
    throw e;
  }
};

exports.notifySoldOut = async options => {
  try {
    const shop = await DB.Shop.findOne({ _id: options.product.shopId });
    if (!shop) {
      return;
    }

    if (shop.email) {
      Service.Mailer.send("product/sold-out-alert.html", shop.email, {
        subject: `Sold out product "${options.product.name}"`,
        product: options.product,
        productVariant: options.productVariant
      });
    }

    if (process.env.EMAIL_NOTIFICATION_LOW_STOCK) {
      Service.Mailer.send(
        "product/sold-out-alert.html",
        process.env.EMAIL_NOTIFICATION_LOW_STOCK,
        {
          subject: `Sold out product "${options.product.name}". Shop "${shop.name}"`,
          product: options.product,
          productVariant: options.productVariant
        }
      );
    }
  } catch (e) {
    throw e;
  }
};

exports.updateSoldOut = async productId => {
  try {
    // check variant, if have variant and quantity is 0, update to sold out
    // otherwise check product
    let soldOut = false;
    const variantCheck = await DB.ProductVariant.countDocuments({
      productId,
      stockQuantity: { $lte: 0 }
    });

    if (variantCheck) {
      soldOut = true;
    } else {
      const product = await DB.Product.findOne({ _id: productId });
      if (product.stockQuantity <= 0) {
        soldOut = true;
      }
    }

    return DB.Product.update(
      { _id: productId },
      {
        $set: { soldOut }
      }
    );
  } catch (e) {
    throw e;
  }
};

exports.updateShopStatus = async productId => {
  try {
    const product =
      productId instanceof DB.Product
        ? productId
        : await DB.Product.findOne({ _id: productId });
    if (!product || !product.shopId) {
      return false;
    }

    const shop = await DB.Shop.findOne({ _id: product.shopId });
    if (!shop) {
      return false;
    }
    product.shopFeatured = shop.featured;
    product.shopActivated = shop.activated;
    product.shopVerified = shop.verified;
    return product.save();
  } catch (e) {
    throw e;
  }
};

exports.getProductsCsv = async user => {
  try {
    // get product and populate to csv content
    let products;
    if (user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      products = await DB.Product.find({isDeleted: false});
    }else{
      products = await DB.Product.find({ shopId: user.shopId, isDeleted: false });
    }
    const productIds = products.map(p => p._id);
    const productVariants = productIds.length
      ? await DB.ProductVariant.find({ productId: { $in: productIds } })
      : [];
    const results = [];

    // filter and map product catgory to product
    let categories = [];
    const categoryIds = products.map(p => p.categoryId);
    if (categoryIds.length) {
      categories = await DB.ProductCategory.find({
        _id: {
          $in: categoryIds
        }
      });
    }

    products.forEach(product => {
      const dataProduct = product.toJSON();
      dataProduct.productType = "Product";
      dataProduct.parent = "";
      if (product.categoryId) {
        const category = _.find(
          categories,
          c => c._id.toString() === product.categoryId.toString()
        );
        if (category) {
          dataProduct.categoryName = category.name;
        }
      }
      results.push(dataProduct);
      const variants = productVariants.filter(
        v => v.productId.toString() === product._id.toString()
      );
      variants.forEach(variant => {
        const dataVariant = variant.toJSON();
        dataVariant.parent = dataProduct.name;
        dataVariant.name = dataProduct.name;
        dataVariant.productType = "Variant";
        results.push(dataVariant);
      });
    });

    return results;
  } catch (e) {
    throw e;
  }
};

// TODO - move to queue
exports.importCsv = async (shopId, csvFilePath) => {
  try {
    const jsonArray = await csv().fromFile(csvFilePath);
    if (!jsonArray.length) {
      //throw new Error("Csv file is empty");
      throw new Error("File CSV không được để trống!");
    }
    const testData = jsonArray[0];
    let valid = true;
    const shopData = await DB.Shop.findOne({
      _id: shopId
    });
    const shop = shopData.toObject();
    // validate content of the csv
    [
      Enums.ProductEnums.ExportCSVKeys.Category.value,
      Enums.ProductEnums.ExportCSVKeys.SAP.value,
      Enums.ProductEnums.ExportCSVKeys.Name.value,
      Enums.ProductEnums.ExportCSVKeys.SalePrice.value,
      Enums.ProductEnums.ExportCSVKeys.UnitSalePrice.value,
      Enums.ProductEnums.ExportCSVKeys.Price.value,
      Enums.ProductEnums.ExportCSVKeys.UnitPrice.value,
      Enums.ProductEnums.ExportCSVKeys.Lang.value,
      Enums.ProductEnums.ExportCSVKeys.SKU.value,
      Enums.ProductEnums.ExportCSVKeys.Weight.value,
      Enums.ProductEnums.ExportCSVKeys.PackageSpecifications.value,
      Enums.ProductEnums.ExportCSVKeys.Producer.value,
      Enums.ProductEnums.ExportCSVKeys.ShortDescription.value,
      Enums.ProductEnums.ExportCSVKeys.ExpiryDate.value,
      Enums.ProductEnums.ExportCSVKeys.Description.value,
      Enums.ProductEnums.ExportCSVKeys.Country.value,
      Enums.ProductEnums.ExportCSVKeys.IsActive.value,
      Enums.ProductEnums.ExportCSVKeys.IsPromotion.value
    ].forEach(key => {
      if (!_.has(testData, key)) {
        valid = false;
      }
    });
    if (!valid) {
      //throw new Error("Invalid CSV format");
      throw new Error("File CSV không đúng định dạng!");
    }

    let row = 0;
    for (const productData of jsonArray) {
      row++;
      // create or update product if not have
      if (!productData[Enums.ProductEnums.ExportCSVKeys.SAP.value] || !productData[Enums.ProductEnums.ExportCSVKeys.Category.value]) {
        //throw new Error(`Please input product SAP and Category Name! (row: ${row})`);
        throw new Error(`Vui lòng nhập mã SAP và Tên loại sản phẩm! (dòng: ${row})`);
      }

      let product = await DB.Product.findOne({
        shopId,
        sap: productData[Enums.ProductEnums.ExportCSVKeys.SAP.value],
        isDeleted: false
      });

      let category = await DB.ProductCategory.findOne({
        name: { $regex: new RegExp(`^${productData[Enums.ProductEnums.ExportCSVKeys.Category.value].trim()}$`, 'i')},
        isDeleted: false
      });

      if(!category){
        //throw new Error(`Category ${productData[Enums.ProductEnums.ExportCSVKeys.Category.value].trim()} not found! (row: ${row})`);
        throw new Error(`Không tìm thấy loại sản phẩm ${productData[Enums.ProductEnums.ExportCSVKeys.Category.value].trim()}! (Dòng: ${row})`);
      }else{
        const childCategory = await DB.ProductCategory.findOne({ parentId: category._id, isDeleted: false });
        if(childCategory){
          //throw new Error(`Current product category is parent category! (row: ${row})`);
          throw new Error(`Loại sản phẩm hiện tại là parent category! (Dòng: ${row})`);
        }
      }

      if (!product) {
        product = new DB.Product({ shopId });
        product.sap = productData[Enums.ProductEnums.ExportCSVKeys.SAP.value];
      }      

      if(productData[Enums.ProductEnums.ExportCSVKeys.IsPromotion.value].trim().toLowerCase() === 'true'){
        if (parseFloat(productData[Enums.ProductEnums.ExportCSVKeys.SalePrice.value]) !== 0 || parseFloat(productData[Enums.ProductEnums.ExportCSVKeys.Price.value]) !== 0) {
          //throw new Error(`Sale price and price value must be equal to zero or empty! (row: ${row})`);
          throw new Error(`Giá bán WE và Giá bán NTD phải bằng 0! (Dòng: ${row})`);
        }
      }else{
        if (parseFloat(productData[Enums.ProductEnums.ExportCSVKeys.SalePrice.value]) <= 0 || parseFloat(productData[Enums.ProductEnums.ExportCSVKeys.Price.value]) <= 0) {
          //throw new Error(`Sale price and price value must be greater than zero! (row: ${row})`);
          throw new Error(`Giá bán WE và Giá bán NTD phải lớn hơn 0! (Dòng: ${row})`);
        }
      }

      product.type = category.alias;
      product.categoryId = category._id;
      product.name = productData[Enums.ProductEnums.ExportCSVKeys.Name.value];
      product.lang = productData[Enums.ProductEnums.ExportCSVKeys.Lang.value];
      product.shortDescription = productData[Enums.ProductEnums.ExportCSVKeys.ShortDescription.value];
      product.description = productData[Enums.ProductEnums.ExportCSVKeys.Description.value];
      product.price = parseFloat(productData[Enums.ProductEnums.ExportCSVKeys.Price.value]) || 0;
      product.salePrice = parseFloat(productData[Enums.ProductEnums.ExportCSVKeys.SalePrice.value]) || 0;
      product.unitPrice = Helper.App.getKeyEnumWithValue(Enums.ProductEnums.ProductUnit, productData[Enums.ProductEnums.ExportCSVKeys.UnitPrice.value].trim().toLowerCase());
      product.unitSalePrice = Helper.App.getKeyEnumWithValue(Enums.ProductEnums.ProductUnit, productData[Enums.ProductEnums.ExportCSVKeys.UnitSalePrice.value].trim().toLowerCase());
      product.weight = productData[Enums.ProductEnums.ExportCSVKeys.Weight.value];
      product.packingSpecifications = productData[Enums.ProductEnums.ExportCSVKeys.PackageSpecifications.value];
      product.producer = productData[Enums.ProductEnums.ExportCSVKeys.Producer.value];
      product.expiryDate = productData[Enums.ProductEnums.ExportCSVKeys.ExpiryDate.value];
      product.country = productData[Enums.ProductEnums.ExportCSVKeys.Country.value];
      product.isActive = productData[Enums.ProductEnums.ExportCSVKeys.IsActive.value].trim().toLowerCase();
      product.isPromotion = productData[Enums.ProductEnums.ExportCSVKeys.IsPromotion.value].trim().toLowerCase();
      product.sku = productData[Enums.ProductEnums.ExportCSVKeys.SKU.value];
      
      let alias = Helper.App.removeAccents(productData[Enums.ProductEnums.ExportCSVKeys.Name.value]);
      const count = await DB.Product.countDocuments({ alias });
      if (count) {
        product.alias = `${alias}-${Helper.String.randomString(5)}`;
      }else{
        product.alias = alias;
      }

      await product.save();
    }

  } catch (e) {
    throw e;
  }
};

function setFlagToNode(node, ids) {
  let flag = false;
  const index = _.findIndex(ids, id => id.toString() === node._id.toString());
  if (index > -1) {
    node.flag = true;
    flag = true;
  }

  if (node.children) {
    node.children.forEach(childNode => {
      const f1 = setFlagToNode(childNode, ids);
      if (f1) {
        node.flag = true;
        flag = true;
      }
    });
  }

  return flag;
}

function removeNonFlag(array, node, index) {
  if (!node.flag) {
    array.splice(index, 1);
  } else if (node.children) {
    let i = node.children.length;
    while (i--) {
      if (!node.children[i].flag) {
        node.children.splice(i, 1);
      } else {
        removeNonFlag(node.children, node.children[i], i);
      }
    }
  }
}

exports.getShopCategoryTree = async shopId => {
  try {
    // TODO - get cache here
    const shopCategory = await DB.Product.aggregate([
      {
        $match: {
          shopId: Helper.App.toObjectId(shopId)
        }
      },
      {
        $group: {
          _id: "$categoryId"
        }
      }
    ]);

    if (!shopCategory || !shopCategory.length) {
      return [];
    }
    const shopCategoryIds = shopCategory.map(c => c._id);

    const categories = await DB.ProductCategory.find()
      .populate({
        path: "mainImage",
        select: "_id filePath mediumPath thumbPath uploaded type"
      })
      .sort({ ordering: -1 });
    const tree = Helper.Utils.unflatten(categories.map(c => c.toJSON()));
    tree.forEach(n => setFlagToNode(n, shopCategoryIds));
    let i = tree.length;
    while (i--) {
      removeNonFlag(tree, tree[i], i);
    }

    return tree;
  } catch (e) {
    throw e;
  }
};

exports.syncProductDataForInventory = async () => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "GET",
          url: `${process.env.DELIVERY_API}/api/product/productEComSync`,
          headers: {
            "content-type": "application/json",
            "x-api-key": `${process.env.DELIVERY_API_KEY}`
          },
        },
        (error, response, body) => {
          let syncRes = null;
          if(response){
            syncRes = {
              body: JSON.parse(response.body),
              statusCode:  response.statusCode,
              statusMessage: response.statusMessage,
            };
          }
          return resolve(syncRes);
        }
      );
    });
  } catch (e) {
    return;
  }
};

exports.updateAliasForAllProduct = async () => {
  try{
    const products = await DB.Product.find();
    if(products && products.length > 0){
      for(let i = 0; i < products.length; i++){
        let product = products[i];
        product.alias = Helper.App.removeAccents(product.name.trim().toLowerCase());
        await product.save();
      };
    }
   
  }catch(e){
    throw e;
  }
}
