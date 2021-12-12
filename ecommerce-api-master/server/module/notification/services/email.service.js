const request = require("request");

exports.sendEmailFromInvest = async (data) => {
    try {
      return new Promise((resolve, reject) => {
        request(
          {
            method: "POST",
            url: `${process.env.INVEST_API}/api/v1/Notification/Send-Mail`,
            headers: {
              "content-type": "application/json",
              "x-api-key": `${process.env.INVEST_API_KEY}`
            },
            json: {
                UserId: data.userId,
                Subject: data.subject,
                Content: data.content,
                IsSendAdmin: data.isSendAdmin
            }
          },
          (error, response, body) => {
            if (error) {
              reject(error);
            }

            if(!body){
              return reject(new Error("Body response is empty"));
            }

            if(body.StatusCode !== 200){
              return reject(new Error(body.Message));
            }
  
            return resolve(body);
          }
        );
      });
    } catch (e) {
      throw e;
    }
  };