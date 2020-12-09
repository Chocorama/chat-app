const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();

const publicDirectoryPath = path.join(__dirname, '../public');
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const io = socketio(server);

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Chat Bot', 'welcome'));
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage(
          'Chat Bot',
          `${user.username} has joined the '${room}' chatroom`
        )
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    const { username, room } = getUser(socket.id);

    if (filter.isProfane(message)) {
      return callback('profanity is not allowed');
    }

    io.to(room).emit('message', generateMessage(username, message));
    setTimeout(() => {
      callback('Delivered');
    }, 100);
  });

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    const { username, room } = getUser(socket.id);
    const message = `https://google.com/maps?q${latitude},${longitude}`;

    io.to(room).emit(
      'locationMessage',
      generateLocationMessage(username, message)
    );

    setTimeout(() => {
      callback();
    }, 700);
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Chat Bot', `${user.username} has left!`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`App is started on port ${port}`);
});
