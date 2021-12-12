const Schema = require("mongoose").Schema;

const schema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order"
    },
    changedBy: {
      type: String
    },
    eventType: {
      type: String,
      index: true,
      enum: ["orderStatus", "cancelOrder", "changeQuantityOrderDetail","createShipment","asyncProductData",
              "wcdWritePO", "wcdWritePODetail","wcdGetPODocNo","wcdCheckPODocNo","wcdConfirmWriteDoc"],
      default: "orderStatus"
    },
    oldData: {
      type: Schema.Types.Mixed
    },
    newData: {
      type: Schema.Types.Mixed
    },
    description: {
      type: String
    },
    createdAt: {
      type: Date
    },
    updatedAt: {
      type: Date
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }
);

module.exports = schema;
