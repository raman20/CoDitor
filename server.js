const log = console.log;
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const port = 3009;


app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/hello.html');
})

app.get('/:roomId', (req, res) => {
    res.render(__dirname + '/app.ejs', { roomId: req.params.roomId });
})

http.listen(port, () => {
    log(`server listening on port ${port}`);
});

io.on('connection', (socket) => {

    socket.on('join room', (ROOM_ID, userId) => {
        socket.join(ROOM_ID);
        socket.to(ROOM_ID).emit('user connected', userId);
    })

    socket.on('new message', (e, ROOM_ID) => {
        log(e)
        socket.to(ROOM_ID).emit('message', e)
    });
});


io.on('disconnect', (evt) => {
    log('some people left')
})