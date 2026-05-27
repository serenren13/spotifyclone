const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.set('io', io);

io.on('connection', (socket) => {
    socket.on('join-conversation', ({ conversationId }) => {
        socket.join(conversationId);
    });
    socket.on('leave-conversation', ({ conversationId }) => {
        socket.leave(conversationId);
    });
    socket.on('join-user-room', ({ userId }) => {
        socket.join(`user:${userId}`);
    });
});

server.listen(PORT, () => console.log('Server running on port ' + PORT));
