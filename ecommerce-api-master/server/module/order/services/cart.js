/* eslint no-param-reassign: 0, no-await-in-loop: 0, no-restricted-syntax: 0, no-continue: 0 */
const _ = require('lodash');

const SITE_CURRENCY = process.env.SITE_CURRENCY || 'VND';

/**
 * calculate cart information and return about price, shipping price, etc...
 * @param {*} data
 */
exports.calculate = async (data, user) => {
  try {
    // get currency if have
    const currency = SITE_CURRENCY;
    const userCurrency = data.userCurrency || currency;
    const currencyExchangeRate = 1;
    // if (data.userCurrency) {
    //   try {
    //     currencyExchangeRate = await Service.Currency.getRate(currency, userCurrency);
    //   } catch (e) {
    //     currencyExchangeRate = 1;
    //   }
    // }

    const productIds = data.products.map(p => p.productId);
    const products = await DB.Product.find({ _id: { $in: productIds } })
        .populate('mainImage')
        .populate('shop');
    if (!products.length) {
      throw new Error('Không có sản phẩm');
    }

    const mappingProducts = [];
    data.products.filter((product) => {
      const p = products.find(i => i._id.toString() === product.productId);
      if (p) {
        product.product = p;
        product.shop = p.shop;

        mappingProducts.push(product);
        return true;
      }

      return false;
    });

    // TODO - check product stock quantity, check shipping method or COD
    const orderDetails = [];
    const order = {
      currency: SITE_CURRENCY,
      userCurrency: SITE_CURRENCY,
      currencyExchangeRate
    };
    const totalProducts = 0;
    let totalPrice = 0;
    // TODO - check shipping fee deeply with shop settings
    // outstock product msg
    let outstockProduct = '';
    for (const product of mappingProducts) {
      let taxPrice = 0;
      // let shippingPrice = 0;
      let unitPrice;
      if (
          user.userRoles.find(
              x => x.Role === Enums.UserEnums.UserRole.WE_FREE.value
          )
      ) {
        unitPrice = product.product.price;
      } else {
        unitPrice = product.product.salePrice || product.product.price;
      }
      // let unitPrice = product.product.salePrice || product.product.price;
      //let stockQuantity = product.product.stockQuantity;
      let variant;

      const orderDetail = {
        shopId: product.shop._id,
        productId: product.product._id,
        productVariantId: product.productVariantId,
        quantity: product.quantity || 1,
        unitPrice,
        currency: SITE_CURRENCY,
        userCurrency,
        currencyExchangeRate,
        error: false,
        taxClass: product.product.taxClass,
        taxPercentage: product.product.taxPercentage,
        freeShip: product.product.freeShip,
        storeWideShipping: product.shop.storeWideShipping,
        shippingSettings: _.pick(product.shop.shippingSettings, [
          'defaultPrice',
          'perQuantityPrice'
        ]),
        product: product.product,
        restrictFreeShipAreas: product.product.restrictFreeShipAreas
      };

      // recheck freeship setting
      // if (!orderDetail.freeShip) {
      //   let freeShip = false;
      //   _.each(product.product.restrictFreeShipAreas, area => {
      //     if (
      //       area.areaType === "zipCode" &&
      //       data.zipCode &&
      //       area.value === data.zipCode
      //     ) {
      //       freeShip = true;
      //     } else if (
      //       area.areaType === "city" &&
      //       data.city &&
      //       area.value === data.city
      //     ) {
      //       freeShip = true;
      //     } else if (
      //       area.areaType === "state" &&
      //       data.state &&
      //       area.value === data.state
      //     ) {
      //       freeShip = true;
      //     } else if (
      //       area.areaType === "country" &&
      //       data.country &&
      //       area.country === data.country
      //     ) {
      //       freeShip = true;
      //     }
      //   });
      //   orderDetail.freeShip = freeShip;
      // }

      if (product.productVariantId) {
        variant = await DB.ProductVariant.findOne({
          _id: product.productVariantId
        });
        if (variant) {
          unitPrice =
              variant.salePrice ||
              variant.price ||
              product.salePrice ||
              product.price;
          //stockQuantity = variant.stockQuantity;
          // if (variant.stockQuantity < orderDetail.quantity) {
          //   // TODO - check here and throw error?
          //   orderDetail.error = true;
          //   orderDetail.errorMessage = `Sản phẩm '${product.product.name}' số lượng chỉ còn ${stockQuantity}`;

          //   if (stockQuantity === 0) {
          //     orderDetail.errorMessage = `Sản phẩm '${product.product.name}' đã hết hàng`;
          //   }
          //   outstockProduct += `${orderDetail.errorMessage},`;
          //   // continue;
          // }
        }

        orderDetail.variant = variant;
      } //else if (product.product.stockQuantity < orderDetail.quantity) {
        // TODO - check here and throw error?
      //   orderDetail.error = true;
      //   orderDetail.errorMessage = `Sản phẩm '${product.product.name}' số lượng chỉ còn ${stockQuantity}`;

      //   if (stockQuantity === 0) {
      //     orderDetail.errorMessage = `Sản phẩm '${product.product.name}' đã hết hàng`;
      //   }
      //   outstockProduct += `${orderDetail.errorMessage},`;
      //   // continue;
      // }
      // calculate and update coupon data
      const discountPercentage = 0;
      // if (product.couponCode) {
      //   const coupon = await Service.Coupon.checkValid(
      //     product.shop.id,
      //     product.couponCode
      //   );
      //   if (coupon && coupon !== false) {
      //     orderDetail.discountPercentage = coupon.discountPercentage;
      //     orderDetail.couponCode = coupon.code;
      //     orderDetail.couponName = coupon.name;
      //     discountPercentage = coupon.discountPercentage;
      //   }
      // }

      const priceBeforeDiscount = unitPrice;
      const productPrice = Helper.Number.round(discountPercentage
          ? priceBeforeDiscount * (discountPercentage / 100)
          : priceBeforeDiscount);
      orderDetail.unitPrice = productPrice;

      if (product.taxPercentage && product.taxClass) {
        taxPrice = Math.round(productPrice * (product.taxPercentage / 100), 2);
        orderDetail.taxPrice = taxPrice;
        orderDetail.taxClass = product.taxClass;
        orderDetail.taxPercentage = product.taxPercentage;
        orderDetail.userTaxPrice = Helper.Number.round(taxPrice * currencyExchangeRate);
      }

      orderDetail.productPrice = productPrice;
      totalPrice += orderDetail.productPrice;
      orderDetail.userProductPrice = Helper.Number.round(productPrice * currencyExchangeRate);
      //orderDetail.stockQuantity = stockQuantity;

      orderDetails.push(orderDetail);
    }

    order.totalProducts = totalProducts;
    order.totalPrice = totalPrice;
    order.userTotalPrice = Helper.Number.round(totalPrice * currencyExchangeRate);

    order.products = orderDetails;
    // order.outstockProduct = outstockProduct.substring(
    //   0,
    //   outstockProduct.length - 1
    // );
    return order;
  } catch (e) {
    throw e;
  }
};

exports.calculateShippingPrice = async (data) => {
  try {
    // get currency if have
    const userCurrency = data.userCurrency || SITE_CURRENCY;
    const currencyExchangeRate = 1;
    // if (data.userCurrency) {
    //   try {
    //     currencyExchangeRate = await Service.Currency.getRate(currency, userCurrency);
    //   } catch (e) {
    //     currencyExchangeRate = 1;
    //   }
    // }

    const productIds = data.products.map(p => p.productId);
    const products = await DB.Product.find({ _id: { $in: productIds } })
        .populate('mainImage')
        .populate('shop');
    if (!products.length) {
      throw new Error('Không có sản phẩm');
    }
    const mappingProducts = [];
    data.products.filter((product) => {
      const p = products.find(i => i._id.toString() === product.productId);
      if (p) {
        product.product = p;
        product.shop = p.shop;
        mappingProducts.push(product);
        return true;
      }

      return false;
    });

    // TODO - check product stock quantity, check shipping method or COD
    const orderDetails = [];
    const order = {
      currency: SITE_CURRENCY,
      userCurrency,
      currencyExchangeRate
    };

    let totalProducts = 0;
    let totalPrice = 0;
    const shopsInCart = [];
    // TODO - check shipping fee deeply with shop settings
    let outstockProduct = '';
    for (const product of mappingProducts) {
      if (product.product.isTradeDiscount == false) {
        return PopulateResponse.forbidden();
      }

      let taxPrice = 0;
      // let shippingPrice = 0;
      let unitPrice = product.product.salePrice || product.product.price;
      let stockQuantity = product.product.stockQuantity;
      let variant;

      const orderDetail = {
        shopId: product.shop._id,
        productId: product.product._id,
        productVariantId: product.productVariantId,
        quantity: product.quantity || 1,
        unitPrice,
        currency: SITE_CURRENCY,
        userCurrency,
        currencyExchangeRate,
        error: false,
        taxClass: product.product.taxClass,
        taxPercentage: product.product.taxPercentage,
        freeShip: product.product.freeShip,
        storeWideShipping: product.shop.storeWideShipping,
        shippingSettings: _.pick(product.shop.shippingSettings, [
          'defaultPrice',
          'perQuantityPrice'
        ]),
        product: product.product,
        restrictFreeShipAreas: product.product.restrictFreeShipAreas
      };

      // recheck freeship setting
      if (!orderDetail.freeShip) {
        let freeShip = false;
        _.each(product.product.restrictFreeShipAreas, (area) => {
          if (
              area.areaType === 'zipCode' &&
              data.zipCode &&
              area.value === data.zipCode
          ) {
            freeShip = true;
          } else if (
              area.areaType === 'city' &&
              data.city &&
              area.value === data.city
          ) {
            freeShip = true;
          } else if (
              area.areaType === 'state' &&
              data.state &&
              area.value === data.state
          ) {
            freeShip = true;
          } else if (
              area.areaType === 'country' &&
              data.country &&
              area.country === data.country
          ) {
            freeShip = true;
          }
        });
        orderDetail.freeShip = freeShip;
      }

      if (product.productVariantId) {
        variant = await DB.ProductVariant.findOne({
          _id: product.productVariantId
        });
        if (variant) {
          unitPrice =
              variant.salePrice ||
              variant.price ||
              product.salePrice ||
              product.price;
          stockQuantity = variant.stockQuantity;
          if (variant.stockQuantity < orderDetail.quantity) {
            // TODO - check here and throw error?
            orderDetail.error = true;
            orderDetail.errorMessage = `Sản phẩm '${product.product.name}' số lượng chỉ còn ${stockQuantity}`;

            if (stockQuantity === 0) {
              orderDetail.errorMessage = `Sản phẩm '${product.product.name}' đã hết hàng`;
            }
            outstockProduct += `${orderDetail.errorMessage},`;
            // continue;
          }
        }

        orderDetail.variant = variant;
      } else if (stockQuantity < orderDetail.quantity) {
        // TODO - check here and throw error?
        orderDetail.error = true;
        orderDetail.errorMessage = `Sản phẩm '${product.product.name}' số lượng chỉ còn ${stockQuantity}`;

        if (stockQuantity === 0) {
          orderDetail.errorMessage = `Sản phẩm '${product.product.name}' đã hết hàng`;
        }
        outstockProduct += `${orderDetail.errorMessage},`;
        // continue;
      }
      // calculate and update coupon data
      let discountPercentage = 0;
      if (product.couponCode) {
        const coupon = await Service.Coupon.checkValid(
            product.shop.id,
            product.couponCode
        );
        if (coupon && coupon !== false) {
          orderDetail.discountPercentage = coupon.discountPercentage;
          orderDetail.couponCode = coupon.code;
          orderDetail.couponName = coupon.name;
          discountPercentage = coupon.discountPercentage;
        }
      }

      const priceBeforeDiscount = unitPrice;
      const productPrice = Helper.Number.round(discountPercentage
          ? priceBeforeDiscount * (discountPercentage / 100)
          : priceBeforeDiscount);
      orderDetail.unitPrice = productPrice;

      if (product.taxPercentage && product.taxClass) {
        taxPrice = Math.round(productPrice * (product.taxPercentage / 100), 2);
        orderDetail.taxPrice = taxPrice;
        orderDetail.taxClass = product.taxClass;
        orderDetail.taxPercentage = product.taxPercentage;
        orderDetail.userTaxPrice = Helper.Number.round(taxPrice * currencyExchangeRate);
      }

      orderDetail.productPrice = productPrice;
      totalPrice += orderDetail.productPrice;
      totalProducts += orderDetail.quantity;
      orderDetail.userProductPrice = Helper.Number.round(productPrice * currencyExchangeRate);
      orderDetail.stockQuantity = stockQuantity;

      orderDetails.push(orderDetail);

      // TODO - check here for shipping price

      const index = shopsInCart.findIndex(s => s.id === orderDetail.shopId);
      if (index === -1) {
        // not found
        shopsInCart.push({
          id: orderDetail.shopId,
          district: product.shop.shippingSettings.district,
          city: product.shop.shippingSettings.city,
          ward: product.shop.shippingSettings.ward,
          address: product.shop.shippingSettings.address,
          totalProductWeight: product.product.weight * orderDetail.quantity
        });
      } else {
        shopsInCart[index].totalProductWeight +=
            orderDetail.quantity * product.product.weight;
      }
    }

    // check shipping price
    let shippingPrice = 0;
    for (const shop of shopsInCart) {
      const shippingData = await Service.GHTK.getShippingFee({
        shop: {
          district: shop.district,
          city: shop.city,
          ward: shop.ward,
          pickAddress: shop.address
        },
        customer: {
          city: data.city,
          district: data.district,
          address: data.streetAddress
        },
        weight: shop.totalProductWeight,
        transport: 'road'
      });

      if (shippingData.fee.fee === 0) {
        order.errorMessage = 'Địa chỉ giao hàng không được hỗ trợ';
      }
      shippingPrice += shippingData.fee.fee;
    }
    order.shippingPrice = shippingPrice;
    order.totalProducts = totalProducts;
    order.totalPrice = totalPrice + shippingPrice;
    order.userTotalPrice =
        Helper.Number.round(totalPrice * currencyExchangeRate) + shippingPrice;

    order.outstockProduct = outstockProduct.substring(
        0,
        outstockProduct.length - 1
    );
    order.products = orderDetails;
    return order;
  } catch (e) {
    throw e;
  }
};
