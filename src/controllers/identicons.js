'use strict';

const grvtr = require('grvtr');

module.exports = (app, io) => {

  app.get('/image', (req, res) => {
    res.redirect(grvtr.create(req.query.q, {
      size: 200,     // 1- 2048px
      defaultImage: 'identicon', // 'identicon', 'monsterid', 'wavatar', 'retro', 'blank'
      rating: 'g',   // 'pg', 'r', 'x'
      secure: true,
      forceDefault: true
    }));
  });

};