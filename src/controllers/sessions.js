'use strict';

const https = require('https');

module.exports = (app, io) => {

  app.get('/status', app.protect, (req, res) => {
    app.db(
      'SELECT id, username, display_name, display_img FROM users WHERE id = $1',
      [req.user],

      (err, result) => {
        if (err) return res.status(500).end();
        if (result.length === 0) return res.status(403).end();
        res.json(result[0]);
      }
    )
  });

  app.get('/wtf', (req, res) => {
    for (let i = 1; i < 105; i ++) {
      const j = i;
      console.log(j);
      https.get('https://randomuser.me/api/', (api) => {
        let body = '';
        console.log('xx');
        api.on('data', (chunk) => {
          body += chunk;
        });
        api.on('end', () => {
          console.log(body);
          const response = JSON.parse(body);
          const last = response.results[0].user.name.last;
          const name = ' ' + name[0].toUpperCase() + name.substr(1);

          app.db(
            'UPDATE users SET display_name = display_name || $1 WHERE id = $2',
            [name, j],

            (err, result) => {
              console.log('done ' + j);
            }
          );
        });
      });
    }
  });

  app.post('/register', (req, res) => {
    https.get('https://randomuser.me/api/', (api) => {
      let body = '';
      api.on('data', (chunk) => {
        body += chunk;
      });
      api.on('end', () => {
        const response = JSON.parse(body);
        const user = response.results[0].user;
        const name = user.name.first;
        req.body.username = req.body.username || name;
        req.body.password = req.body.password || '1234';
        req.body.display_name = req.body.display_name || (name[0].toUpperCase() + name.substr(1));
        req.body.display_img = req.body.display_img || user.picture.thumbnail;
        app.db(
          'INSERT INTO users (username, password, display_name, display_img) VALUES ($1, $2, $3, $4) RETURNING id, username, display_name, display_img',
          [req.body.username, req.body.password, req.body.display_name, req.body.display_img],

          (err, result) => {
            if (err) return res.status(400).end();
            console.log(result);
            const token = app.sign(result[0].id);
            res.cookie(app.key, token);
            result[0].token = token;
            res.json(result[0]);
          }
        );
      });
    });
  });

  app.post('/login', (req, res) => {
    app.db(
      'SELECT id, username, display_name, display_img FROM users WHERE username = $1 AND password = $2',
      [req.body.username, req.body.password],

      (err, result) => {
        if (err) return res.status(500).end();
        if (result.length === 0) return res.status(403).end();
        const token = app.sign(result[0].id);
        res.cookie(app.key, token);
        result[0].token = token;
        res.json(result[0]);
      }
    );
  });

  app.get('/logout', (req, res) => {
    res.clearCookie(app.key);
    res.json({ status: 200 });
  });

};
