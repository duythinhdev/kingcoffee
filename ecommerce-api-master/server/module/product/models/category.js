const Schema = require("mongoose").Schema;

const schema = new Schema(
  {
    type: {
      type: String,
      default: null
    },
    name: {
      type: String
    },
    alias: {
      type: String,
      index: true
    },
    description: {
      type: String
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory"
    },
    level: {
      type: Number,
      default: 1
    },
    mainImage: {
      type: Schema.Types.ObjectId,
      ref: "Media"
    },
    totalProduct: {
      type: Number,
      default: 0
    },
    metaSeo: {
      keywords: {
        type: String,
        default: ""
      },
      description: {
        type: String,
        default: ""
      }
    },
    ordering: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date
    },
    updatedAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    isPromotion: {
      type: Boolean,
      default: false
    },
  },
  {
    minimize: false,
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    },
    toJSON: { virtuals: true }
  }
);

schema.virtual('parentCategory', {
  ref: schema.name,
  localField: 'parentId', 
  foreignField: '_id' 
});


module.exports = schema;
