'use strict';

module.exports = (app, io) => {

  app.get('/friends', app.protect, (req, res) => {
    app.db(
      'SELECT id, display_name, status FROM friendships JOIN users ON id = user_2 WHERE user_1 = $1',
      [req.user],

      (err, result) => {
        if (err) return res.status(500).end();
        res.json(result);
      }
    );
  });

  app.get('/friends/pending', app.protect, (req, res) => {
    app.db(
      'SELECT id, display_name FROM friendships JOIN users ON id = user_1 WHERE user_2 = $1 AND status = \'pending\'',
      [req.user],

      (err, result) => {
        if (err) return res.status(500).end();
        res.json(result);
      }
    );
  });

  app.post('/friends/request', app.protect, (req, res) => {
    app.db(
      'INSERT INTO friendships (user_1, user_2, status) VALUES ($1, $2, \'pending\')',
      [req.user, req.body.target],

      (err, result) => {
        if (err) return res.status(400).end();
        app.db(
          'SELECT 1 FROM friendships WHERE user_1 = $1 AND user_2 = $2 AND status = \'pending\'',
          [req.body.target, req.user],

          (err, result) => {
            if (err) return res.status(500).end();
            if (result.length === 0) return res.status(200).end();
            app.db(
              'UPDATE friendships SET status = \'accepted\' WHERE (user_1 = $1 AND user_2 = $2) OR (user_1 = $3 or user_2 = $4)',
              [req.user, req.body.target, req.body.target, req.user],

              (err, result) => {
                if (err) return res.status(500).end();
                res.status(200).end();
              }
            )
          }
        );
      }
    );
  });

};