'use strict';

const express = require('express');
const fs = require('fs');
const http = require('http');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);

require('./core/config')(app, io);
require('./core/app')(app, io, server);

server.listen(process.env.PORT);