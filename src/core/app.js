'use strict';

const fs = require('fs');
const path = require('path');
const peer = require('peer');

module.exports = (app, io, server) => {
  const dir = path.join(__dirname, '..', 'controllers');

  for (let file of fs.readdirSync(dir)) {
    if (file[0] !== '.') {
      const absolute = path.join(dir, file);
      require(absolute)(app, io);
    }
  }

  app.use('/peerjs', peer.ExpressPeerServer(server, { debug: true }));
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../../test.html'));
  });

  app.use('*', (req, res) => {
    res.status(404).end();
  });

  app.use('*', (err, req, res, next) => {
    res.status(403).end();
  });
};