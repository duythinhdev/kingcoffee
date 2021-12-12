require('dotenv').config();

const express = require('express');
const app = require('./app');
const path = require('path');
const chalk = require('chalk');
const cluster = require('cluster');
const os = require('os');

app.app.use('/docs', express.static(path.join(__dirname, '..', 'apidocs')));
if (cluster.isMaster) {
    console.log(chalk.red('[Cluster]'), 'Master process run.', process.pid);
    for (let i = 0, coreCount = os.cpus().length; i < coreCount; i++) {
      const worker = cluster.fork();
    }
    cluster.on(
      'exit',
      (worker, code, signal) => {
        console.log(chalk.yellow('[Cluster]'), 'Worker ended.', worker.process.pid);
        console.log(chalk.yellow('[Cluster]'), 'Worker Die:', worker.exitedAfterDisconnect);
        if (!worker.exitedAfterDisconnect) {
          var worker = cluster.fork();
        }
      }
    );
    app.jobSchedule();
    app.jobPromotion();
  } else {
    app.startHttpServer();
    console.log(chalk.red('[Worker]'), 'Worker started', process.pid);
  }
