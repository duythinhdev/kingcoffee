// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true,
  version: '218',
  build: 1,

  // Product
  apiBaseUrl: 'https://api-ecommerce.womencando.com.vn/v1',
  investUrl: 'https://api-wallet.womencando.com.vn/api/v1',
  identityUrl: 'https://api-identity.womencando.com.vn/api/v1',
  tniDSCUrl: 'https://api-seller.womencando.com.vn/api',
  investWebUrl: 'https://wallet.womencando.com.vn',
  webUserUrl: 'https://womencando.com.vn',


  // FDS test
  // apiBaseUrl: 'https://api-ecommerce.tni.stg.nichietsuvn.com/v1',
  // investUrl: 'https://api-invest.tni.stg.nichietsuvn.com/api/v1',
  // identityUrl: 'https://api-identity.tni.stg.nichietsuvn.com/api/v1',
  // apiBaseUrl: 'https://we40-ecommerce-api.fdssoft.com/v1',
  // identityUrl: 'https://we40-identity.fdssoft.com/api/v1',
  // tniDSCUrl: 'https://api-inventory.tni.stg.nichietsuvn.com/api',
  // investWebUrl: 'http://web-invest-v2.tni.dev.ncs.int',

  platform: 'mobile',
  googleClientId: '946463315327-0l0svqeglss2jrulg19t9hs5slem6247.apps.googleusercontent.com',
  facebookAppId: '113570925979091',
  paymentRedirectSuccessUrl: 'https://api.goldtimemart.vn/v1',
  paymentRedirectCancelUrl: 'https://api.goldtimemart.vn/v1',
  stripeKey: 'pk_test_Z3rf3HSfsokHl4lLFTBxhZrZ',
  pusher: {
    appId: 591974,
    key: '8cbf727dad3c8ce84888',
    cluster: 'ap1'
  },
  paymentTypePrice: 1000000,
  investAPIKey: 'ffb46d2c-c318-490d-9de8-f79255af74fa'
};
