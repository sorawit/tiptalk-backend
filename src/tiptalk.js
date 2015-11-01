'use strict';

const express = require('express');
const fs = require('fs');
const https = require('https');
const socket = require('socket.io');

const credentials = {
  key : fs.readFileSync('./ssl/joyyak.com.key', 'utf8'),
  cert: fs.readFileSync('./ssl/joyyak.com.chained.crt', 'utf8'),
};

const app = express();
const server = https.createServer(credentials, app);
const io = socket(server);

require('./core/config')(app, io);
require('./core/app')(app, io, server);

server.listen(process.env.PORT);