const request = require("request");

exports.VerifyVendor = async (data) => {
  try {
    return new Promise((resolve, reject) => {
        request(
            {
              method: "POST",
              url: `${process.env.INVEST_API}/api/v1/Account/requestvendor`,
              headers: {
                "content-type": "application/json"
              },
              json: {
                  "userId": data.userId,
                  "isVendor": data.isVendor,
                  "NameVendor": data.NameVendor,
                  "Address": data.Address,
                  "Phone": data.Phone,
                  "Email": data.Email
              }
            },
            (error, response, body) => {
              if (error) {
                return reject(error);
              }
    
              if (!body) {
                return reject("cập nhật vendor thất bại");
              }
              
              console.log(body)

              return resolve(body);
            }
          )
    });
  } catch (e) {
    throw e;
  }
};
