/* eslint prefer-arrow-callback: 0 */
const _ = require('lodash');
const Schema = require('mongoose').Schema;

const schema = new Schema({
  ownerId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  username: {
    type: String,
    default: ''
  },
  // store name
  name: {
    type: String
  },
  alias: {
    type: String,
    index: true
  },
  email: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  // shop address
  address: {
    type: String
  },
  // Address details provided by Seller, in case of refund or exchange,
  // buyer will get return address details to return back the product to seller)
  returnAddress: {
    type: String
  },
  location: {
    lat: {
      type: Number,
      default: 0
    },
    long: {
      type: Number,
      default: 0
    }
  },
  city: {
    type: String
  },
  district: {
    type: String
  },
  // country dropdown with iso code https://gist.github.com/keeguon/2310008
  ward: {
    type: String
  },
  zipCode: {
    type: String
  },
  businessInfo: {
    name: {
      type: String,
      default: ''
    },
    identifier: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    }
  },
  bankInfo: {
    bankName: {
      type: String,
      default: ''
    },
    swiftCode: {
      type: String,
      default: ''
    },
    bankId: {
      type: String,
      default: ''
    },
    bankBranchId: {
      type: String,
      default: ''
    },
    bankBranchName: {
      type: String,
      default: ''
    },
    accountNumber: {
      type: String,
      default: ''
    },
    accountName: {
      type: String,
      default: ''
    }
  },
  socials: {
    facebook: String,
    twitter: String,
    google: String,
    linkedin: String,
    youtube: String,
    instagram: String,
    flickr: String
  },
  socialConnected: {
    facebook: {
      type: Boolean,
      default: false
    },
    twitter: {
      type: Boolean,
      default: false
    },
    google: {
      type: Boolean,
      default: false
    },
    linkedin: {
      type: Boolean,
      default: false
    },
  },
  logoId: {
    type: Schema.Types.ObjectId,
    ref: 'Media'
  },
  bannerId: {
    type: Schema.Types.ObjectId,
    ref: 'Media'
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationIssueId: {
    type: Schema.Types.ObjectId,
    ref: 'Media'
  },
  activated: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredTo: {
    type: Date
  },
  // google analytics code
  gaCode: {
    type: String,
    default: ''
  },
  headerText: {
    type: String,
    default: ''
  },
  notifications: {
    lowInventory: {
      type: Boolean,
      default: true
    }
  },
  // store-wide shipping setting
  storeWideShipping: {
    type: Boolean,
    default: false
  },
  shippingSettings: {
    city: {
      type: String,
      default: ""
    },
    district: {
      type: String,
      default: ""
    },
    ward: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    zipCode: {
      type: Number,
      default: 0
    }
  },
  announcement: {
    type: String,
    default: ''
  },
  //Phần trăm chiết khấu cho admin.
  tradeDiscount: {
    type: Number,
    default: 5
  },
  linkQrCode: {
    type: String
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  minimize: false,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

schema.virtual('owner', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true
});

schema.virtual('logo', {
  ref: 'Media',
  localField: 'logoId',
  foreignField: '_id',
  justOne: true
});

schema.virtual('banner', {
  ref: 'Media',
  localField: 'bannerId',
  foreignField: '_id',
  justOne: true
});

schema.virtual('verificationIssue', {
  ref: 'Media',
  localField: 'verificationIssueId',
  foreignField: '_id',
  justOne: true
});

schema.pre('save', async function beforeSave(next) {
  try {
    ['name', 'address', 'returnAddress', 'announcement'].forEach((key) => {
      this[key] = Helper.String.stripTags(this[key]);
    });
    this.headerText = Helper.String.removeScriptTag(this.headerText);

    let alias = this.alias || Helper.String.createAlias(this.name);
    const count = await DB.Shop.countDocuments({ alias, _id: { $ne: this._id } });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5).toLowerCase()}`;
    }

    this.alias = alias.trim();
  } catch (e) {
    Service.Logger.create({
      level: 'error',
      path: 'shop-pre-save',
      error: e
    });
  }

  this._verifiedModified = this.isModified('verified');
  this._activatedModified = this.isModified('activated');
  this._featuredModified = this.isModified('featured');

  next();
});

schema.post('save', async function afterSave(doc, next) {
  try {
    if (doc._verifiedModified || doc._activatedModified || doc._featuredModified) {
      await DB.Product.updateMany({ shopId: doc._id }, {
        $set: {
          shopFeatured: doc.featured,
          shopActivated: doc.activated,
          shopVerified: doc.verified
        }
      });
    }
  } catch (e) {
    Service.Logger.create({
      level: 'error',
      path: 'shop-post-save',
      error: e
    });
  }

  next();
});

schema.method('toJSON', function toJSON() {
  const shop = this.toObject();
  return _.omit(shop, [
    'verificationIssue', 'bankInfo', 'verificationIssueId'
  ]);
});

module.exports = schema;
