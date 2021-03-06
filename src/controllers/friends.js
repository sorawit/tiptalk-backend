'use strict';

module.exports = (app, io) => {

  app.get('/search', app.protect, (req, res) => {
    const searchterm = '%' + req.query.q + '%';
    app.db(
      'SELECT id, username, display_name, display_img FROM users u WHERE (username LIKE $1 OR display_name LIKE $2) AND NOT EXISTS (SELECT 1 FROM friendships WHERE (user_1 = u.id AND user_2 = $3) OR (user_1 = $4 AND user_2 = u.id)) AND u.id <> $5 ORDER BY id',
      [searchterm, searchterm, req.user, req.user, req.user],

      (err, result) => {
        if (err) return res.status(500).end();
        res.json(result);
      }
    );
  });

  app.get('/friends', app.protect, (req, res) => {
    app.db(
      'SELECT id, display_name, display_img, status FROM friendships JOIN users ON id = user_2 WHERE user_1 = $1',
      [req.user],

      (err, result) => {
        if (err) return res.status(500).end();
        res.json(result);
      }
    );
  });

  app.get('/friends/pending', app.protect, (req, res) => {
    app.db(
      'SELECT id, display_name, display_img, \'requested\' AS status FROM friendships JOIN users ON id = user_1 WHERE user_2 = $1 AND status = \'pending\'',
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
        io.to(req.body.target).emit('refresh', {});
        app.db(
          'SELECT 1 FROM friendships WHERE user_1 = $1 AND user_2 = $2 AND status = \'pending\'',
          [req.body.target, req.user],

          (err, result) => {
            if (err) return res.status(500).end();
            if (result.length === 0) return res.json({ status: 200 });
            app.db(
              'UPDATE friendships SET status = \'accepted\' WHERE (user_1 = $1 AND user_2 = $2) OR (user_1 = $3 AND user_2 = $4)',
              [req.user, req.body.target, req.body.target, req.user],

              (err, result) => {
                if (err) return res.status(500).end();
                res.json({ status: 200 });
              }
            )
          }
        );
      }
    );
  });

};
