module.exports = {
  "apps": [{
    "name": "goldtime-ecom-admin",
    "script": "server.js",
    "watch": true,
    "env": {
      "NODE_ENV": "development"
    },
    "env_production": {
      "NODE_ENV": "production"
    }
  }],
}
