import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http';
import { NavParams, Platform } from 'ionic-angular';
@Injectable()
export class SpinService {

    constructor(
        private http: HTTP,
        private httpClient: HttpClient,
        public platform: Platform,
    ) {

    }
    async getSpinId(url) {
        let headers =
        {
            'Api-key': "rL`CN>5]q^mcR*Bq",
            'Content-type': 'application/x-www-form-urlencoded'
        };
        try {
            return await this.http.get(url, {}, headers)
        } catch (error) {
            console.log(error);
        }
    }

    async getUserInfo(member_id, device_id) {
        return new Promise((resolve, reject) => {
          
        if (!device_id) {
            device_id = 'd8da544894e56aea';
        }
        let headers =
        {
            'Api-key': "MpCXXNwc3CcZ",
            'Content-type': 'application/x-www-form-urlencoded'
        };

        let url = 'https://crm.kingcoffee.com/tcoqcode_api/app_check_customer/';
        let body = {
            "user_id": member_id,
            "device_id": device_id,
        }
        this.http.post(url, body, headers)
            .then(async res => {
                const data = JSON.parse(res.data);
                if (data.code == 1) {
                    resolve(data.data) 
                }
                else{
                    resolve(data.data) 
                }
            })
            .catch(error => {
                console.log(error);

            })
        });
    }


    async getReward(spinId) {
        const url = `https://crm.kingcoffee.com/tcoqcode_api/get_gift?spin_id=${spinId}`;
        let headers =
        {
            'Api-key': "rL`CN>5]q^mcR*Bq",
            'Content-type': 'application/x-www-form-urlencoded'
        };
        try {
            return await this.http.get(url, {}, headers)
        } catch (error) {
            console.log(error);
        }

    }
    async get_result_spin(user_id) {
        const url = `https://crm.kingcoffee.com/tcoqcode_api/get_result_spin?user_id=${user_id}`;
        let headers =
        {
            'Api-key': "rL`CN>5]q^mcR*Bq",
            'Content-type': 'application/x-www-form-urlencoded'
        };
        try {
            return await this.http.get(url, {}, headers)
        } catch (error) {
            console.log(error);
        }

    }
    async getSpinId1(url) {
        let headers =
        {
            'Api-key': "rL`CN>5]q^mcR*Bq",
            'Content-type': 'application/x-www-form-urlencoded'
        };

        return this.httpClient.get(url,
            {
                headers: headers
            }).toPromise();

    }
    async getReward1(spinId) {
        const url = `https://crm.kingcoffee.com/tcoqcode_api/get_gift?spin_id=${spinId}`;
        let headers =
        {
            'Api-key': "rL`CN>5]q^mcR*Bq",
            'Content-type': 'application/x-www-form-urlencoded'
        };
        return this.httpClient.get(url,
            {
                headers: headers
            }).toPromise();
    }

}