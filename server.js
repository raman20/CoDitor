const log = console.log;
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const port = process.env.PORT || 3505;
const request = require("request");

const codeObj = {
    clientId: "3cfe4aad88fcf8ba5d0bcb5d742cf9d9",
    clientSecret: "d9d9ff736afe347d80aaeb8882e822dec003109b381495fd01ce125381059df3"
}

app.use(express.static(__dirname + '/build', { index: __dirname + '/hello.html' }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/hello.html');
})

app.get('/join/:roomId', (req, res) => {
    res.sendFile(__dirname + '/build/index.html');
})

app.get('/end', (req, res) => {
    res.sendFile(__dirname + '/end.html');
})

http.listen(port, () => {
    log(`server listening on port ${port}`);
});


io.on('connection', (socket) => {

    socket.on('join room', (ROOM_ID, userId) => {
        socket.join(ROOM_ID);
        socket.to(ROOM_ID).emit('user connected', userId);
    })

    socket.on('new message', (data, ROOM_ID) => {
        log(data)
        socket.to(ROOM_ID).emit('message', data);
    });

    socket.on('code run', (ROOM_ID, script, lang, version) => {

        socket.to(ROOM_ID).emit('loading', 1);

        codeObj['script'] = script;
        codeObj['language'] = lang;
        codeObj['versionIndex'] = version;




        request({
            url: 'https://api.jdoodle.com/v1/execute',
            method: "POST",
            json: codeObj
        },
            function (error, response, body) {
                io.in(ROOM_ID).emit('code response', body);
            });
    })

    socket.on('leave-meeting', (ROOM_ID) => {
        socket.leave(ROOM_ID);
        socket.emit('left');
        console.log(ROOM_ID + " -> someone left");
    })
});


io.on('disconnect', (evt) => {
    log('some people left');
})
