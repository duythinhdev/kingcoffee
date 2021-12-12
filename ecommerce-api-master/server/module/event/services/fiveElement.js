const request = require('request');

exports.ping = async () => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'GET',
          url: `${process.env.NHTS_API}/api/v1/home`,
          headers: {
            'x-api-key': `${process.env.INVEST_API_KEY}`
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          return resolve(body);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.insertEvent = async (data) => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'POST',
          url: `${process.env.NHTS_API}/api/v2/import-buy-ticket`,
          headers: {
            'content-type': 'application/json',
            'x-api-key': `${process.env.INVEST_API_KEY}`
          },
          json: {
            OwnerId: data.ownerId,
            OwnerName: data.ownerName,
            SponsorTicketCode: data.sponsorTicketCode
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          return resolve(body);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.getUpline = async (data) => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'GET',
          url: `${process.env.NHTS_API}/api/v1/home/getupline?newOwnerId=${data}`,
          headers: {
            'x-api-key': `${process.env.INVEST_API_KEY}`
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (typeof body === 'string') {
            return resolve(JSON.parse(body));
          }

          return resolve(body);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.getList = async (data) => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'POST',
          url: `${process.env.NHTS_API}/api/v1/home/GetTrees`,
          headers: {
            'content-type': 'application/json',
            'x-api-key': `${process.env.INVEST_API_KEY}`
          },
          json: {
            OwnerName: data.ownerName,
            FatherName: data.fatherName,
            SponsorName: data.sponsorName,
            Level: data.level,
            NumberChild: data.numberChild,
            ticketCode: data.ticketCode,
            PageNumber: data.pageNumber,
            PageSize: data.pageSize,
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (typeof body === 'string') {
            return resolve(JSON.parse(body).data);
          }

          return resolve(body.data);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.getTotal = async () => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'GET',
          url: `${process.env.NHTS_API}/api/v2/get-report-buy-ticket`,
          headers: {
            'content-type': 'application/json',
            'x-api-key': `${process.env.INVEST_API_KEY}`
          },
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (typeof body === 'string') {
            return resolve(JSON.parse(body).data);
          }

          return resolve(body.data);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.getWinTickCode = async () => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'GET',
          url: `${process.env.NHTS_API}/api/v2/get-win-ticketcode`,
          headers: {
            'x-api-key': `${process.env.INVEST_API_KEY}`
          }
        },
        (error, response, body) => {
          if (response.statusCode !== 200) {
            return reject({ NHTS_CODE: response.statusCode });
          }

          if (error) {
            return reject(error);
          }

          if (!body) {
            return reject('Lấy mã quay thưởng không thành công');
          }

          return resolve(JSON.parse(body));
        }
      );
    });
  } catch (e) {
    throw e;
  }
};
