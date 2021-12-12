const jwt = require("jsonwebtoken");
const request = require('request');
const fs = require('fs');
const ECKey = require('ec-key');

exports.getProfile = async (reqObj) => {
    const decodedIdToken = jwt.decode(reqObj.identityToken);
    console.log('decodedIdToken: ', decodedIdToken);
    try {
        return new Promise((resolve, reject) => request({
            method: 'POST',
            url: `https://appleid.apple.com/auth/token`,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            form: {
                client_id: decodedIdToken.aud,
                client_secret: createEDSAKeyFromFile(),
                code: reqObj.authorizationCode,
                grant_type: 'authorization_code',
                // grant_type: 'refresh_token',
                // refresh_token: 'r1d56d94b1e7a4a7ba78d782df0405b6d.0.srqvt.S44wQQoHNL2Oee0e52EjsQ',
                redirect_uri: process.env.INVEST_API
            }
          }, (error, response, body) => {
            if (error) {
              return reject(error);
            }
            const data = JSON.parse(body);
            console.log('data: ', data);
            if (data.error) {
              return reject(data);
            }
            const dataDecoded = jwt.decode(data.id_token);
            return resolve(dataDecoded);
          })
        );
    } catch (e) {
        throw e;
    }
}

function createEDSAKeyFromFile() {
    const key_file = __dirname + '/../../../../Apple_PK.pem';
    const team_id = 'T52D325QH6'
    const client_id = 'com.tnicommerce'
    const key_id = 'VFJ5T8U5UW'

    const pem = fs.readFileSync(key_file);
    const privateKey = new ECKey(pem, 'pem').toString();

    const header = {
        kid: key_id
    }

    const now = new Date().getTime();
    const claim = {
        iss: team_id,
        iat: (now / 1000) >> 0,
        exp: ((now + (86400 * 180)) / 1000) >> 0,
        aud: 'https://appleid.apple.com',
        sub: client_id
    }

    const token = jwt.sign(claim, privateKey, { algorithm: 'ES256', header: header});
    return token;
}