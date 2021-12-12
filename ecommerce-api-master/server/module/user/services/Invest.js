const request = require("request");

const ChannelId = process.env.CHANNEL_ID || 7;
const EXPIRE_TOKEN_DURATION = process.env.EXPIRE_TOKEN_DURATION || 31536000;
const msgTwoFaCodeEnable = "Đã bật bảo mật 2 lớp";
const signToken = require('../../passport/auth.service').signToken;

exports.TwoFaCodeEnableErr = msgTwoFaCodeEnable;

//Call to identity invest login
exports.crossLogin = async (username, password, twoFaCode = "", deviceId = "1") => {
  try {
    return new Promise((resolve, reject) =>
        request(
            {
              method: "POST",
              rejectUnauthorized: false,
              uri: `${process.env.IDENTITY_API}/api/v1/login`,
              json: true,
              body: {
                UserName: username,
                Password: password,
                TwoFaCode: twoFaCode,
                DeviceId: deviceId
              }
            },
            (err, response, body) => {

              if (err) {
                return reject(err);
              }

              if (!body) {
                return reject(new Error("Login is unsuccessful"))
              }

              // console.log("body: ", body);
              if (body.StatusCode !== 200) {
                if (body.StatusCode === 2) {
                  //Yêu cầu mã xác thực
                  return reject(msgTwoFaCodeEnable);
                }

                return reject(new Error(body.Message));
              }

              return resolve(body.Data);
            }
        )
    );
  } catch (error) {
    return reject(new Error("Login is unsuccessful"));
  }
};

//Get current user infomation from identity invest
exports.getUserMe = async(token) => {
  try {
    return new Promise((resolve, reject) =>
        request(
            {
              method: "GET",
              rejectUnauthorized: false,
              uri: `${process.env.IDENTITY_API}/api/v1/users/me`,
              headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            },
            (err, response, body) => {
              if (err) {
                return reject(err);
              }

              if (!body) {
                return reject(new Error("Unauthorized"))
              }

              body = JSON.parse(body);

              if (body.StatusCode !== 200) {
                return reject(new Error(body.Message));
              }

              return resolve(body.Data);
            }
        )
    );
  } catch (error) {
    return reject(new Error("Unauthorized"));
  }
}

//service save user infomation from invest to ecommer
//data - current user infomation
exports.saveUserMe = async (req, data, token) => {
  try {
    if(data){
      // if (data.PhoneNumber) {
      //   if (data.PhoneNumber.slice(0, 1) === '0') {
      //     const newPhone = `(+84) ${data.PhoneNumber.slice(1, data.PhoneNumber.length)}`;
      //     data.PhoneNumber = newPhone;
      //   }
      // }

      let user = null;
      const arrUser = await DB.User.find({ username: new RegExp(data.UserName.toLowerCase(), 'i') });
      if (arrUser.length > 0) {
        if (await arrUser.filter(item => item.username.trim() === data.UserName.toLowerCase().trim()).length > 0) {
          user = await DB.User.findOne({ username: data.UserName });
        }
      }

      if(data.Permissions){
        if(data.Permissions.PermissionItems){
          data.Permissions.PermissionItems = await data.Permissions.PermissionItems.filter(x => ((x.ChannelId == ChannelId) || !x.ChannelId));
        }
      }

      let isNew = false;
      if (!user) {
        user = new DB.User({
          username: data.UserName,
          email: data.Email,
          name: data.FullName,
          phoneNumber: data.PhoneNumber,
          provider: 'invest',
          address: data.Address,
          zipCode: 700000,
          userRoles: data.UserRoles ? data.UserRoles : [],
          inventoryId: data.InventoryId,
          isMember: data.IsMember,
          birthday: data.BirthDay,
          idCard: data.IdCard,
          taxCode: data.TaxCode,
          memberId: data.MemberId,
          typeNPP: data.TypeNPP,
          fax: data.Fax,
          avatar: data.Avatar,
          level: data.Level,
          downlineF1Number: data.DownlineF1Number,
          permissions: data.Permissions
        });

        await user.save();
        isNew = true;
      }else{
        await DB.User.update(
            { _id: user._id },
            {
              $set: {
                firstName: data.FullName,
                lastName: data.FullName,
                phoneNumber: data.PhoneNumber,
                address: data.Address,
                isShop: data.IsVendor,
                email: data.Email,
                name: data.FullName,
                userRoles: data.UserRoles,
                inventoryId: data.InventoryId,
                isMember: data.IsMember,
                birthday: data.BirthDay,
                idCard: data.IdCard,
                taxCode: data.TaxCode,
                memberId: data.MemberId,
                typeNPP: data.TypeNPP,
                fax: data.Fax,
                avatar: data.Avatar,
                level: data.Level,
                downlineF1Number: data.DownlineF1Number,
                permissions: data.Permissions
              }
            }
        );
      }

      let tradeDiscount = 0;
      // Login seller
      if (req.headers.platform === 'seller') {
        if (!user.isShop || !user.shopId) {
          throw Error("Tài khoản của bạn chưa đăng ký kênh bán hàng!");
        }

        if (!data.IsVendor) {
          throw Error("Tài khoản của bạn chưa được quản trị viên phê duyệt!");
        }

        tradeDiscount = data.TradeDiscount >= 0 ? data.TradeDiscount : 5;

        await DB.Shop.update(
            { _id: user.shopId },
            {
              $set: {
                tradeDiscount
              }
            }
        );
      }

      if (req.headers.platform === 'admin') {
        if (!user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
          throw Error("Tài khoản không có quyền đăng nhập");
        }
      }

      let social;
      social = await DB.UserSocial.findOne({
        userId: user._id,
        socialId: data.UserId,
      },null, {sort: {createdAt: -1 }});

      if (!isNew) {
        if (!social) {
          social = new DB.UserSocial({
            userId: user._id,
            social: 'invest',
            socialId: data.UserId,
            socialInfo: data
          });
        }
      } else {
        if (!social) {
          social = new DB.UserSocial({
            userId: user._id,
            social: 'invest',
            socialId: data.UserId,
            socialInfo: data
          });
        }

        // đây là họ
        const last = data.FullName.substring(
            0,
            data.FullName.lastIndexOf(' ') + 1
        );
        // đây là tên
        const first = data.FullName.substring(
            data.FullName.lastIndexOf(' ') + 1,
            data.FullName.length
        );
        const spaceCount = data.FullName.split(' ').length - 1;
        if (spaceCount > 0) {
          user.set('shippingAddress', [
            {
              firstName: first,
              lastName: last,
              phoneNumber: data.PhoneNumber,
              city: {
                id: data.CityId,
                name: data.City
              },
              ward: {
                id: data.WardId,
                name: data.Ward
              },
              district:{
                id: data.DistrictId,
                name: data.District
              },
              address: data.AddressDefault,
              zipCode: data.zipCode,
              default: true,
              isProfile: true
            }
          ]);
        } else {
          user.set('shippingAddress', [
            {
              firstName: data.FullName,
              lastName: data.FullName,
              phoneNumber: data.PhoneNumber,
              city: {
                id: data.CityId,
                name: data.City
              },
              ward: {
                id: data.WardId,
                name: data.Ward
              },
              district:{
                id: data.DistrictId,
                name: data.District
              },
              address: data.AddressDefault,
              zipCode: data.zipCode,
              default: true,
              isProfile: true
            }
          ]);
        }
      }

      social.accessToken = token;
      social.socialInfo = data;
      await social.save();
      await user.save();

      const expireTokenDuration = parseInt(EXPIRE_TOKEN_DURATION);
      const now = new Date();
      const expiredAt = new Date(now.getTime() + expireTokenDuration * 1000);
      const resToken = signToken(user._id, user.userRoles, expireTokenDuration);
      var res = {
        token: resToken,
        expiredAt,
        isVendor: data.IsVendor,
        tradeDiscount
      };

      return res;
    }

    throw Error("Login is unsuccessful");
  }
  catch (error) {
    console.log('error --- ', error);
    throw Error(error);
  }
}

//Get code from posapp
exports.getCode = async () => {
  try {
    return new Promise((resolve, reject) =>
        request(
            {
              method: "GET",
              uri: `${process.env.POSAPP_API}/getcode`
            },
            (err, response, body) => {
              if (err) {
                return reject(err);
              }

              if (!body) {
                return reject(new Error("Lấy mã code không thành công"))
              }

              return resolve(body);
            }
        )
    );
  } catch (error) {
    throw error;
  }
};

//Get province list from Invest - user's shipping address
exports.getProvince = async () => {
  try {
    return new Promise((resolve, reject) =>
        request(
            {
              method: 'GET',
              rejectUnauthorized: false,
              uri: `${process.env.INVEST_API}/api/v1/Location/GetProvincesInVietnam`
            },
            (err, response, body) => {
              if (err) {
                return reject(err);
              }

              if (!body) {
                return reject(new Error('Lấy thông tinh tỉnh/thành không thành công'));
              }

              return resolve(JSON.parse(body).Data);
            }
        ));
  } catch (error) {
    throw error;
  }
};

//Get ward list from Invest - user's shipping address
exports.getWard = async (params) => {
  try {
    return new Promise((resolve, reject) =>
        request(
            {
              method: 'GET',
              rejectUnauthorized: false,
              uri: `${process.env.INVEST_API}/api/v1/Location/GetWardsByDistrictId?districtId=${params}`
            },
            (err, response, body) => {
              if (err) {
                return reject(err);
              }

              if (!body) {
                return reject(new Error('Lấy thông tinh quận/huyện không thành công'));
              }

              return resolve(JSON.parse(body).Data);
            }
        ));
  } catch (error) {
    throw error;
  }
};

//Get district list from Invest - user's shipping address
exports.getDistrict = async (params) => {
  try {
    return new Promise((resolve, reject) =>
        request(
            {
              method: 'GET',
              rejectUnauthorized: false,
              uri: `${process.env.INVEST_API}/api/v1/Location/GetDistrictsByProvinceId?provinceId=${params}`
            },
            (err, response, body) => {
              if (err) {
                return reject(err);
              }

              if (!body) {
                return reject(new Error('Lấy thông tinh phường/xã không thành công'));
              }

              return resolve(JSON.parse(body).Data);
            }
        ));
  } catch (error) {
    throw error;
  }
};

exports.registerUserFromSocial = async (paramObj) => {
  try {
    return new Promise((resolve, reject) =>
      request(
      {
        method: 'POST',
        rejectUnauthorized: false,
        uri: `${process.env.INVEST_API}/api/v1/Account/RegisterTNI`,
        json: true,
        headers: {
          'content-type': 'application/json',
          'x-api-key': `${process.env.INVEST_API_KEY}`
        },
        body: paramObj
      },
      (err, response, body) => {
        if (err) {
          return reject(err);
        }
        if (!body) {
          return reject(new Error("Register is unsuccessful"))
        }
        console.log("body: ", body);
        if (body.StatusCode !== 200) {
          return reject(new Error(body.Message));
        }
        return resolve(body.Data);
      })
    )} catch (e) {
    throw e;
  }
}

exports.crossLoginSocial = async (username, password, twoFaCode = "", deviceId = "1") => {
  try {
    return new Promise((resolve, reject) =>
        request(
            {
              method: "POST",
              rejectUnauthorized: false,
              uri: `${process.env.IDENTITY_API}/api/v1/loginSocial`,
              json: true,
              headers: {
                'content-type': 'application/json',
                'x-api-key': `${process.env.IDENTITY_API_KEY}`
              },
              body: {
                UserName: username,
                Password: password,
                TwoFaCode: twoFaCode,
                DeviceId: deviceId
              }
            },
            (err, response, body) => {

              if (err) {
                return reject(err);
              }

              if (!body) {
                return reject(new Error("Login is unsuccessful"))
              }

              // console.log("body: ", body);
              if (body.StatusCode !== 200) {
                if (body.StatusCode === 2) {
                  //Yêu cầu mã xác thực
                  return reject(msgTwoFaCodeEnable);
                }

                return reject(new Error(body.Message));
              }

              return resolve(body.Data);
            }
        )
    );
  } catch (error) {
    return reject(new Error("Login is unsuccessful"));
  }
};