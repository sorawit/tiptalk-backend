'use strict';

module.exports = (app, io) => {

  const broadcast = (id) => {
    app.db(
      'SELECT id FROM friendships JOIN users ON id = user_2 WHERE user_1 = $1 AND status = \'accepted\'', [id], (err, result) => {
        if (err) return;
        for (let row of result) {
          io.to(row.id + '').emit('status', {
            id: id,
            online: (!!io.active[id]),
            peer: io.active[id],
          });
        }
    });
  }

  io.on('connection', (socket) => {
    let id = undefined;

    socket.on('register', (data /* token, peer */) => {
      try {
        id = app.unsign(data.token);
        socket.join(id);
        socket.emit('ready', {});
      } catch(e) {
        socket.disconnect();
      }
    });

    socket.on('status', (data /* online, peer */) => {
      if (!id) return;
      if (data.online) {
        io.active[id] = data.peer;
      } else {
        delete io.active[id];
      }
      broadcast(id);
    });

    socket.on('query', () => {
      app.db(
        'SELECT id FROM friendships JOIN users ON id = user_2 WHERE user_1 = $1 AND status = \'accepted\'', [id], (err, result) => {
          if (err) return;
          socket.emit('query', {
            result: result.filter((row) => {
              return !!io.active[row.id];
            }).map((row) => {
              return {
                id: row.id,
                peer: io.active[row.id],
              };
            })
          });
      });
    });

    socket.on('disconnect', () => {
      if (!id) return;
      delete io.active[id];
      broadcast(id);
    });

  });

};
