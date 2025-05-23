/* eslint prefer-arrow-callback: 0, no-param-reassign: 0 */
const Schema = require('mongoose').Schema;

const schema = new Schema({
  name: {
    type: String
  },
  alias: {
    type: String,
    index: true
  },
  shortDescription: {
    type: String
  },
  description: {
    type: String
  },
  type: {
    type: String,
    default: ''
  },
  weight: {
    type: Number,
    default: 0
  },
  price: {
    type: Number, // NTD price
    default: 0
  },
  unitPrice: {
    type: String,
    enum: ['bag', 'package', 'box', 'wire', 'can', 'bottle'] // túi, bịch, hộp, dây, lon, chai
  },
  salePrice: {
    type: Number, // WE price
    default: 0
  },
  unitSalePrice: {
    type: String,
    enum: ['bag', 'package', 'box', 'wire', 'can', 'bottle'] // túi, bịch, hộp
  },
  discounted: {
    type: Boolean,
    default: false
  },
  // base on shop country
  // it is not editable but fill from profile automatically
  currency: {
    type: String,
    uppercase: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductCategory'
  },
  brandId: {
    type: Schema.Types.ObjectId,
    ref: 'Brand'
  },
  shopId: {
    type: Schema.Types.ObjectId,
    ref: 'Shop'
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  // base on  the category
  specifications: [{
    _id: false,
    key: String, // eg color
    value: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  hot: {
    type: Boolean,
    default: false
  },
  bestSell: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  // // Ngũ hành tương sinh
  // fiveElement: {
  //   type: Boolean,
  //   default: false
  // },
  configs: {
    type: Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: Number,
    default: 2
  },
  note: {
    type: String
  },
  /*
  Sản phẩm chấp nhận chịu chiết khấu admin(~20% giá trị sản phẩm) sẽ có giá trị = 'true'.
  Nếu giá trị = 'false' sẽ không được thực hiện hành vi mua bán thông qua hệ thống ecommerce,
  chỉ có thể xem trên giao diện và liên hệ trực tiếp seller để giao dịch bên ngoài hệ thống.
  */
  isTradeDiscount: {
    type: Boolean,
    default: true
  },
  // stock keeping unit
  sku: {
    type: String,
    default: ''
  },
  // univeral product code
  upc: {
    type: String,
    default: ''
  },
  // manufater part number
  mpn: {
    type: String,
    default: ''
  },
  // european article number
  ean: {
    type: String,
    default: ''
  },
  // japanese artical number
  jan: {
    type: String,
    default: ''
  },
  // international standard book number
  isbn: {
    type: String,
    default: ''
  },
  metaSeo: {
    keywords: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  },
  images: [{
    type: Schema.Types.ObjectId,
    ref: 'Media'
  }],
  mainImage: {
    type: Schema.Types.ObjectId,
    ref: 'Media'
  },
  shopVerified: {
    type: Boolean,
    default: false
  },
  shopActivated: {
    type: Boolean,
    default: false
  },
  shopFeatured: {
    type: Boolean,
    default: false
  },
  taxClass: {
    type: String
  },
  taxPercentage: {
    type: Number,
    default: 0
  },
  digitalFileId: {
    type: Schema.Types.ObjectId,
    ref: 'Media'
  },
  restrictCODAreas: [{
    type: String,
    default: []
  }],
  freeShip: {
    type: Boolean,
    default: false
  },
  restrictFreeShipAreas: [{
    _id: false,
    areaType: {
      type: String,
      enum: ['zipCode', 'city', 'state', 'country']
    },
    value: String,
    name: String
  }],
  dailyDeal: {
    type: Boolean,
    default: false
  },
  dealTo: {
    type: Date
  },
  soldOut: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sap: {
    type: String
  },
  expiryDate: {
    type: Number
  },
  packingSpecifications: {
    type: Number
  },
  producer: {
    type: String
  },
  country: {
    type: String
  },
  lang: {
    type: String
  },
  promotions:[
    {
      type: Schema.Types.ObjectId,
      ref: "Promotion"
    }
  ],
  isPromotion: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  }
}, {
  minimize: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

schema.virtual('category', {
  ref: 'ProductCategory', // The model to use
  localField: 'categoryId', // Find people where `localField`
  foreignField: '_id', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true
});

schema.virtual('brand', {
  ref: 'Brand', // The model to use
  localField: 'brandId', // Find people where `localField`
  foreignField: '_id', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true
});

schema.virtual('shop', {
  ref: 'Shop',
  localField: 'shopId',
  foreignField: '_id',
  justOne: true
});

// schema.virtual('images', {
//   ref: 'Media',
//   localField: 'images',
//   foreignField: '_id',
//   justOne: false
// });

schema.virtual('digitalFile', {
  ref: 'Media',
  localField: 'digitalFileId',
  foreignField: '_id',
  justOne: true
});

schema.index({
  name: 'text'
});

schema.pre('save', async function beforeSave(next) {
  if (this.images.length && !this.mainImage) {
    this.mainImage = this.images[0];
  }

  // remove tags
  this.description = Helper.String.removeScriptTag(this.description);
  ['name', 'shortDescription', 'sku', 'upc', 'mpn', 'ean', 'jan', 'jsbn', 'taxClass'].forEach((key) => {
    this[key] = Helper.String.stripTags(this[key]);
  });
  let alias = this.alias || Helper.String.createAlias(this.name);
  const count = await DB.Product.countDocuments({ alias, _id: { $ne: this._id } });
  if (count) {
    alias = `${alias}-${Helper.String.randomString(5).toLowerCase()}`;
  }
  this.alias = alias.trim();

  if (this.specifications && this.specifications.length) {
    this.specifications.forEach((spec) => {
      spec.value = Helper.String.stripTags(spec.value);
    });
  }
  this.metaSeo.keywords = Helper.String.stripTags(this.metaSeo.keywords);
  this.metaSeo.description = Helper.String.stripTags(this.metaSeo.description);

  next();
});

// TODO - unset for id fields when respond JSON

module.exports = schema;
