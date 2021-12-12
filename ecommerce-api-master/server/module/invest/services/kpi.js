const request = require('request');

exports.checkDownlineUser = async (token, url) => {
    try {
      return new Promise((resolve, reject) => {
        request(
          {
            method: 'GET',
            url: url,
            headers: {
              'content-type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          },
          (error, response, body) => {

            if (response.statusCode != 200) {
                return resolve(new Error(response.statusMessage));
            }

            if (error) {
              return resolve(error);
            }
  
            if (!body) {
              return resolve(new Error('Không tìm thấy user!'));
            }

            if (body){
                let newBody = JSON.parse(body);
                if(newBody.StatusCode === 200 && newBody.Data){
                    newBody.listCustomerNumber = newBody.Data.map(x => x.CustomerNumber);                
                    return resolve(newBody);
                }else{
                  return resolve(newBody);
                }               
            }
            return resolve(body);
          }
        );
      });
    } catch (e) {
      throw e;
    }
  };