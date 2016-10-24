// Setup basic express server
var path            = require('path');
var express         = require('express');
var app             = express();
var server          = require('http').createServer(app);
var io              = require('socket.io')(server);
var port            = process.env.PORT || 3333;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
// Routing

io.on('connection', function (socket) {
    var remoteAddress = socket.client.conn.remoteAddress.split(':').pop();
    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        var room = [data.username, data.otherUsername].sort().join("|");
        console.log(room)
        io.in(room).emit('new message', data);
    });

    socket.on('join', function (data) {
        var room = [data.username, data.otherUsername].sort().join("|");
        console.log(room)
        socket.join(room)
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username,
            otherUsername: socket.otherUsername,
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username,
            otherUsername: socket.otherUsername,
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
            console.log(remoteAddress + ' left');
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                otherUsername: socket.otherUsername,
            });
    });
});
