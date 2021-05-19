const log = console.log;
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const port = 3505;
const request = require("request");

const codeObj = {
    clientId: "3cfe4aad88fcf8ba5d0bcb5d742cf9d9",
    clientSecret: "d9d9ff736afe347d80aaeb8882e822dec003109b381495fd01ce125381059df3"
}

app.set('view engine', 'ejs');
app.use(express.static('static'))

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

    socket.on('code run', (ROOM_ID, script, lang, version) => {
        codeObj['script'] = script;
        codeObj['language'] = lang;
        codeObj['versionIndex'] = version;


        console.table(codeObj);

        request({
            url: 'https://api.jdoodle.com/v1/execute',
            method: "POST",
            json: codeObj
        },
            function (error, response, body) {
                console.table(body);
                io.in(ROOM_ID).emit('code response', body);
            });
    })
});


io.on('disconnect', (evt) => {
    log('some people left');
})