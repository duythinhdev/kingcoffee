const path = require("path");
const Joi = require("@hapi/joi");
const firebase = require("firebase-admin");
const configJsonFirebase = require("../../../config/serviceAccountKey.json");
const defaultAppConfig = {
  credential: firebase.credential.cert(configJsonFirebase),
};
// Initialize the default app
firebase.initializeApp(defaultAppConfig);

/**
 * send notification to device
 */
exports.sendToDevice = async (options) => {
  try {
    var validateSchema = Joi.object().keys({
      title: Joi.string().required().messages({
        "string.base": `"title" bắt buộc phải là những ký tự`,
        "string.empty": `"title" không được để trống`,
        "any.required": `Yêu cầu phải có "title"`,
      }),
      body: Joi.string().required().messages({
        "string.base": `"body" bắt buộc phải là những ký tự`,
        "string.empty": `"body" không được để trống`,
        "any.required": `Yêu cầu phải có "body"`,
      }),
      os: Joi.string().valid("ios", "android").required().messages({
        "string.base": `"os" bắt buộc phải là những ký tự`,
        "string.empty": `"os" không được để trống`,
        "any.only": `"os" bắt buộc phải là 'ios' hoặc 'android'`,
        "any.required": `Yêu cầu phải có "os"`,
      }),
      tokenDevice: Joi.string().required().messages({
        "string.base": `"tokenDevice" bắt buộc phải là những ký tự`,
        "string.empty": `"tokenDevice" không được để trống`,
        "any.required": `Yêu cầu phải có "tokenDevice"`,
      }),
    });
    var validate = validateSchema.validate(options);
    if (validate.error) {
      throw new Error(validate.error);
    }

    if (options.os === Enums.FlatformEnums.flatform.IOS.value) {
      await this.sendNotificationToDeviceIOS(options);
    }

    if (options.os === Enums.FlatformEnums.flatform.ANDROID.value) {
      await this.sendNotificationToDeviceANDROID(options);
    }
  } catch (e) {
    throw e;
  }
};

exports.sendNotificationToDeviceIOS = async (data) => {
  let ios = {
    headers: {
      "apns-priority": "10", //mức độ ưu tiên khi push notification
    },
    payload: {
      aps: {
        alert: {
          title: data.title,
        },
        badge: 1,
        sound: "default",
      },
    },
  };
  let message = {
    apns: ios,
    notification: {
      title: data.title,
      body: data.body,
    },
    token: data.tokenDevice, // token của thiết bị muốn push notification
  };
  firebase
    .messaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string.
    })
    .catch((error) => {
      //return error
    });
};

exports.sendNotificationToDeviceANDROID = async (data) => {
  let message = {
    notification: {
      title: data.title,
      body: data.body,
    },
    data: {
      title: data.title,
      content: data.body,
    },
    token: data.tokenDevice, // token của thiết bị muốn push notification
  };
  firebase
    .messaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string.
    })
    .catch((error) => {
      //return error
    });
};
