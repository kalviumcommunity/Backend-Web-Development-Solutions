'use strict';

const { Server } = require('socket.io');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log(`[+] connected: ${socket.id}`);

    // Add this socket to a named room
    socket.on('joinRoom', (data) => {
      socket.join(data.room);
      console.log(`${socket.id} joined ${data.room}`);
    });

    // Remove this socket from a named room
    socket.on('leaveRoom', (data) => {
      socket.leave(data.room);
      console.log(`${socket.id} left ${data.room}`);
    });

    // Broadcast commentAdded to ALL sockets in the room (including the sender)
    socket.on('newComment', (data) => {
      io.to(data.room).emit('commentAdded', data);
      console.log(`commentAdded emitted to room '${data.room}'`);
    });

    // Lifecycle: log disconnection (rooms are auto-cleaned by Socket.IO)
    socket.on('disconnect', (reason) => {
      console.log(`[-] disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

module.exports = { initSocket };
