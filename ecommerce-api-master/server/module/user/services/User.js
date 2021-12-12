const request = require("request");
const _ = require("lodash");

exports.create = async (data) => {
  try {
    const user = new DB.User(data);
    let sendMailPw = false;
    const password = Helper.String.randomString(5);
    if (!data.password && data.email && user.provider === 'local') {
      user.password = password;
      sendMailPw = true;
    }

    await user.save();
    if (sendMailPw) {
      await Service.Mailer.send('user/new-password-create.html', user.email, {
        subject: 'New password has been created',
        password
      });
    }

    return user;
  } catch (e) {
    throw e;
  }
};


exports.GetGoldtimeLatestAccessToken = async (uid) => {
  try {
    return new Promise(async (resovle, reject) => {
      const userSocial = await DB.UserSocial.findOne({ userId: uid, social: 'goldtime' });
      if (!userSocial) {
        return reject(new Error(`Không tìm thấy id người dùng từ Goldtime user#${uid}`))
      }

      resovle(userSocial.socialInfo.Token)
    });
  } catch (e) {
    throw e;
  }
}

exports.GetInvestUserId = async (uid) => {
  try {
    return new Promise(async (resolve, reject) => {
      let userSocial = await DB.UserSocial.findOne({ userId: uid, social: 'invest'}, null, {sort: {createdAt: -1 }});
      if (!userSocial) {
        userSocial = await DB.UserSocial.findOne({ userId: uid, social: 'google'}, null, {sort: {createdAt: -1 }});
      }
      if (!userSocial) {
        userSocial = await DB.UserSocial.findOne({ userId: uid, social: 'apple'}, null, {sort: {createdAt: -1 }});
      }
      if (!userSocial) {
        userSocial = await DB.UserSocial.findOne({ userId: uid, social: 'facebook'}, null, {sort: {createdAt: -1 }});
      }
      if (!userSocial) {
        return reject(new Error(`Không tìm thấy id người dùng từ Invest user#${uid}`))
      }

      resolve(userSocial)
    });
  } catch (e) {
    throw e;
  }
}

exports.updateBankInfoFromInvest = async (params) => {
  try {
    return new Promise((resolve, reject) => {
      request(
          {
            method: "POST",
            rejectUnauthorized: false,
            url: `${process.env.INVEST_API}/api/v1/Account/UpdateBankInfo`,
            headers: {
              "content-type": "application/json",
              "Authorization": `Bearer ${params.token}`
            },
            json: {
              BankId: params.bankId,
              BankBranchName: params.bankBranchName,
              BankHolderName: params.bankHolderName,
              BankNumber: params.bankNumber
            }
          },
          (error, response, body) => {
            if (error) {
              return reject(error);
            }

            if(!body){
              return resolve(_.pick(response,["statusCode", "statusMessage"]))
            }

            return resolve(body);
          }
      );
    });
  } catch (e) {
    throw e;
  }
}

exports.updateBankInfoIntoSocial = async (params) => {
  try{
    if(params){
      const social = await DB.UserSocial.findOne({userId: params.user._id}, null, {sort: {createdAt: -1 }});
      if(social && social.socialInfo){
        social.socialInfo.BankId = params.bankId;
        social.socialInfo.BankName = params.bankName;
        social.socialInfo.BankBranch = params.bankBranchName;
        social.socialInfo.AccountBankHolder = params.bankHolderName;
        social.socialInfo.BankNumber = params.bankNumber;

        social.markModified('socialInfo');
        await social.save();
        return;
      }
    }
  }catch(e){
    throw e;
  }
}

exports.updatePhoneEmailToInvest = async (reqObj, token) => {
  console.log('reqObj: ', reqObj);
  try {
      return new Promise((resolve, reject) => request({
          method: 'POST',
          rejectUnauthorized: false,
          url: `${process.env.INVEST_API}/api/v1/Account/UpdatePhoneEmail`,
          headers: {
            // 'Content-Type': 'application/x-www-form-urlencoded',
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          json: reqObj
        }, (error, response, body) => {
          if (response.statusCode === 401) {
            return reject('Yêu cầu chưa được xác thực');
          } else if (response.statusCode !== 200) {
            return reject(`Yêu cầu không thành công: lỗi ${response.statusCode}`);
          }
          if (error) {
            return reject(error);
          }
          const data = body;
          if (data.error) {
            return reject(data);
          }
          return resolve(data);
        })
      );
  } catch (e) {
      throw e;
  }
}
