const express = require('express');
const http = require('http');
const path = require('path');
require("dotenv").config();

// Allowed extensions list can be extended depending on your own needs
const allowedExt = [
  '.js',
  '.ico',
  '.css',
  '.png',
  '.jpg',
  '.woff2',
  '.woff',
  '.ttf',
  '.svg',
];

const app = express();

app.use(express.static('../deploy/dist'));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../deploy/dist/index.html"));
})

const httpApp = http.createServer(app);
httpApp.listen(process.env.PORT_ADMIN, null, () => {
  // TODO - load env from config
  console.log('Express server listening on %d, in %s mode', process.env.PORT_ADMIN, process.env.NODE_ENV_ADMIN || 'development');
});
