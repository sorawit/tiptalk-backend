'use strict';

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const query = require('pg-query');

query.connectionParameters = 'postgres://root:toor@joyyak.com/root';
const secret = 'e99d74d53cf0fb42f9e9db3c677d1af1'

module.exports = (app, io) => {
  // Hack! Probably need redis/memcache to handle this
  io.active = {};

  // Parsers
  app.use(bodyParser.json());
  app.use(cookieParser());

  // Database connections
  app.db = (stmt, values, cb) => {
    if (cb === undefined) {
      cb = values;
      values = [];
    }
    query(stmt, values, cb);
  };

  // Json web token
  app.key = 'tiptalk-auth';
  app.sign = (id) => jwt.sign(id, secret);
  app.unsign = (token) => jwt.verify(token, secret);
  app.protect = expressJwt({
    secret: secret,
    getToken: (req) => {
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
      } else {
        return req.cookies[app.key];
      }
    },
  });
};
