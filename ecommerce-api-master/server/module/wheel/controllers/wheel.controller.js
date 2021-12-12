const request = require('request');
/**
 * Create a new user
 */
exports.getResult = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(PopulateResponse.notFound());
    } else if (user.wheelSpinned) {
      return next(PopulateResponse.error({
        message: `Người dùng đã dự thưởng trước đó`
      }));
    }
    // const user_id = user.memberId;
    // const device_id = req.body.deviceId;
    // const spin_id = req.body.spinId;
    // const code = req.body.code;
    // const status = req.body.status;
    // const time = getCurrentDateString();
    // const prizesRes = await getPrizesFromCRM(spin_id);
    //
    // // Calculate result
    // const prizes = prizesRes.data;
    // for (let i = 0; i < prizes.length; i++) {
    //   const prob = getRewardProb(prizes[i]);
    //   if (prob > 0 && parseInt(prizes[i].amount) > 0 && (parseInt(prizes[i].amount) > parseInt(prizes[i].amount_used))) {
    //     prizes[i].prob = prizes[i].prob ? prizes[i].prob + prob : prob;
    //   } else {
    //     // Run out of reward or disabled, add prob to QT10
    //     prizes[i].prob = 0;
    //     for (const prize of prizes) {
    //       if (prize.code === 'QT10') {
    //         // Add to QT10
    //         prize.prob = prize.prob ? prize.prob + Math.abs(prob) : Math.abs(prob);
    //       }
    //     }
    //   }
    // }
    // const result = calculateResult(prizes);
    // await DB.User.update({ _id: user._id }, {
    //     $set: { wheelSpinned: prizes[result].code }
    // });
    // await updatePrizeToCRM(user_id, device_id, spin_id, code, prizes[result].id, time, status);
    // setTimeout(async ()=>{
      await sendMailResult(user,'QT1');
    // },10000)
    // return next(PopulateResponse.success({result: { code: prizes[result].code, desc: prizes[result].name }}, "Tạo kết quả thành công"));
  } catch (e) {
    return next(e);
  }
};

async function sendMailResult(user, result) {
  if (result && user) {
    let allResult = [];
    allResult["QT1"] = {
      "resultsName" : 'Xe máy điện Vinfast Impes',
      "templateHtml" : 'wheelspinner/wheelspinner.html',
      "fromMail" : 'traothuong@kingcoffee.com'
    };
    allResult["QT2"] = {
      "resultsName" : 'Xe máy điện Vinfast Feliz',
      "templateHtml" : 'wheelspinner/wheelspinner.html',
      "fromMail" : 'traothuong@kingcoffee.com'
    };
    allResult["QT3"] = {
      "resultsName" : 'Xe máy điện Vinfast Klara S',
      "templateHtml" : 'wheelspinner/wheelspinner.html',
      "fromMail" : 'traothuong@kingcoffee.com'
    };
    allResult["QT4"] = {
      "resultsName" : 'Mũ Bảo Hiểm',
      "templateHtml" : 'wheelspinner/wheelspinner.html',
      "fromMail" : 'traothuong@kingcoffee.com'
    };
    allResult["QT5"] = {
      "resultsName" : 'Balo',
      "templateHtml" : 'wheelspinner/wheelspinner.html',
      "fromMail" : 'traothuong@kingcoffee.com'
    };
    allResult["QT6"] = {
      "resultsName" : 'Túi xách',
      "templateHtml" : 'wheelspinner/wheelspinner.html',
      "fromMail" : 'traothuong@kingcoffee.com'
    };
    allResult["QT7"] = {
      "resultsName" : 'Voucher WE4.0 500k',
      "templateHtml" : 'wheelspinner/wheelspinner.html',
      "fromMail" : 'traothuong@kingcoffee.com'
    };
    allResult["QT8"] = {
      "resultsName" : 'Voucher WE4.0 100k',
      "templateHtml" : 'wheelspinner/wheelspinner.html',
      "fromMail" : 'traothuong@kingcoffee.com'
    };
    allResult["QT10"] = {
      "resultsName" : 'Chúc Bạn May Mắn lần sau',
      "templateHtml" : 'wheelspinner/wheelspinnersnotgive.html',
      "fromMail" : 'hotro@womencando.com.vn'
    };

    await Service.Mailer.send(allResult[result].templateHtml, 'thinh.dockc@hcmut.edu.vn' ,  {
      subject: `Thông Báo Vòng Quay May Mắn ${user.email}`,
      from: allResult[result].fromMail,
      data: {
        type: 'newSendgrid',
        username: user.name,
        phone: user.phoneNumber,
        result: allResult[result].resultsName
      }
    });
    await Service.Mailer.send(allResult[result].templateHtml, 'do.duythinh1@gmail.com',  {
      subject: `Thông Báo Vòng Quay May Mắn ${user.email}`,
      from: allResult[result].fromMail,
      data: {
        type: 'newSendgrid',
        username: user.name,
        phone: user.phoneNumber,
        result: allResult[result].resultsName
      }
    });
    const notGift = "Rất tiếc bạn chưa nhận được giải thưởng từ chương trình, chúc bạn may mắn lần sau. Đừng quên còn nhiều cơ hội trúng thưởng khác đang chờ đón bạn";
    const gift = `Chúc mừng ${user.name}với số điện thoại ${user.phoneNumber}đã may mắn trúng 1 ${allResult[result].resultsName}khi tham gia vòng quay may mắn của chương trình`;
    let option = {
      user: user,
      body:
        {
          type: 'promotionNotification',
          title: 'Thông Báo Vòng Quay May Mắn',
          body: result === 'QT10' ? notGift : gift ,
          userIds: [user._id.toString()],
        },
    };
    await Service.Notification.create(option);
  } else {
    return null;
  }
}

function getCurrentDateString() {
  const dt = new Date((new Date()).getTime() + (3600 * 1000 * 7));
  return `${dt.getDate()
      .toString()
      .padStart(2, '0')}/` +
    `${(dt.getMonth() + 1).toString()
      .padStart(2, '0')}/` +
    `${dt.getFullYear()
      .toString()
      .padStart(4, '0')} ` +
    `${dt.getHours()
      .toString()
      .padStart(2, '0')}:` +
    `${dt.getMinutes()
      .toString()
      .padStart(2, '0')}:` +
    `${dt.getSeconds()
      .toString()
      .padStart(2, '0')}`;
}

function getRewardProb(reward) {
  let result = reward.status === 'A' ?
    1 : -1;
  if (reward.code === 'QT1') {
    result *= 0.01;
  } else if (reward.code === 'QT4') {
    result *= 0.07;
  } else if (reward.code === 'QT5') {
    result *= 0.07;
  } else if (reward.code === 'QT6') {
    result *= 0.07;
  } else if (reward.code === 'QT7') {
    result *= 0.09;
  } else if (reward.code === 'QT8') {
    result *= 0.24;
  } else if (reward.code === 'QT10') {
    result *= 0.45;
  } else {
    result = 0;
  }
  return result;
}

async function getPrizesFromCRM(spinId) {
  try {
    return new Promise((resolve, reject) => request(
      {
        method: 'GET',
        uri: `${process.env.CRM_API}/tcoqcode_api/app_get_gift?spin_id=${spinId}`,
        headers: {
          'Api-key': `${process.env.CRM_API_KEY}`
        },
      },
      (err, response, body) => {
        if (err) {
          return reject(err);
        }
        const data = JSON.parse(body);
        if (data.error) {
          return reject(data);
        }
        return resolve(data);
      }
    ));
  } catch (e) {
    throw e;
  }
}

function calculateResult(prizes) {
  let sum = 0;
  let factor = 0;
  let random = Math.random();
  for (let i = prizes.length - 1; i >= 0; i--) {
    if (prizes[i].status === 'A') {
      sum += prizes[i].prob; // The sum of statistical probabilities
    }
  }
  random *= sum; // Generate probability random numbers
  for (let i = prizes.length - 1; i >= 0; i--) {
    if (prizes[i].status === 'A') {
      factor += prizes[i].prob;
      if (random <= factor) return i;
    }
  }
  return null;
}

async function updatePrizeToCRM(user_id, device_id, spin_id, code, gift_id, time, status) {
  try {
    return new Promise((resolve, reject) => {
      request({
        method: 'POST',
        url: `${process.env.CRM_API}/tcoqcode_api/app_sync_result_spin/`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Api-key': `${process.env.CRM_API_KEY}`
        },
        form: {
          user_id: user_id,
          device_id: device_id,
          spin_id: spin_id,
          coupon_code: code,
          gift_id: gift_id,
          time: time,
          status: status
        }
      }, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        const data = JSON.parse(body);
        if (data.error) {
          return reject(data);
        }
        return resolve(data);
      });
    });
  } catch (e) {
    throw e;
  }
}

exports.getStartDate = async (req, res, next) => {
  const wheelStartDateConfig = await DB.Config.findOne({
    key: 'wheelStartDate'
  });
  return next(PopulateResponse.success({ startDate: wheelStartDateConfig.value }, 'Lấy kết quả thành công'));
};
