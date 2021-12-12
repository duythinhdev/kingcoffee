/* Twilio sms */
const Twilio = require('twilio');
const nconf = require('nconf');
const Queue = require('../../../kernel/services/queue');

const smsQ = Queue.create('sms');

const client = new Twilio(nconf.get('SMS_SID'), nconf.get('SMS_AUTH_TOKEN'));
const request = require("request");

exports.send = body => smsQ.createJob(body).save();

smsQ.process(async (job, done) => {
  try {
    const body = job.data;
    await client.messages.create({
      body: body.text,
      to: body.to, // Text this number
      from: nconf.get('SMS_FROM') // From a valid Twilio number
    });
  } catch (e) {
    await Service.Logger.create({
      level: 'error',
      error: e,
      path: 'sms',
      req: {
        body: job.data
      }
    });
  }

  done();
});

exports.sendSMSFromInvest = async (data) => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "POST",
          url: `${process.env.INVEST_API}/api/v1/Notification/SentSMSTo`,
          headers: {
            "content-type": "application/json",
            "x-api-key": `${process.env.INVEST_API_KEY}`
          },
          json: {
            Mobile: data.phoneNumber,
            SMS: data.smsMessage
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
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
