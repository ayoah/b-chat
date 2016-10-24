var io          = require('socket.io-client');
var readline    = require('readline');
var socket      = io.connect('http://192.168.40.33:3333');

var my = 'client';
var to   = 'client2';

var rl = readline.createInterface({
    input: process.stdin
});

rl.on('line', function(line){
    var input = line.trim();
    if(input) {
        socket.emit('new message', {
            username: my,
            otherUsername  : to,
            message: line.trim()
        });
    }
});

socket.on('connect', function() {
    socket.emit('join', {
        username: my,
        otherUsername  : to
    });

    socket.on('new message', function (data) {
        if(data.username == my) {
            console.log("<我>说：" + data.message)
        } else {
            console.log("<"+data.otherUsername +">说：" + data.message)
        }
    });

});
