'use strict';

module.exports = (app, io) => {

  app.get('/status', app.protect, (req, res) => {
    res.json(req.user);
  });

  app.post('/register', (req, res) => {
    app.db(
      'INSERT INTO users (username, password, display_name) VALUES ($1, $2, $3) RETURNING id',
      [req.body.username, req.body.password, req.body.display_name],

      (err, result) => {
        if (err) return res.status(400).end();
        const token = app.sign(result[0].id);
        res.cookie(app.key, token);
        res.json({ token: token });
      }
    );
  });

  app.post('/login', (req, res) => {
    app.db(
      'SELECT id FROM users WHERE username = $1 AND password = $2',
      [req.body.username, req.body.password],

      (err, result) => {
        if (err) return res.status(500).end();
        if (result.length === 0) return res.status(403).end();
        const token = app.sign(result[0].id);
        res.cookie(app.key, token);
        res.json({ token: token });
      }
    );
  });

  app.get('/logout', (req, res) => {
    res.clearCookie(app.key);
    res.status(200).end();
  });

};