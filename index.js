// Setup basic express server
var path            = require('path');
var express         = require('express');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var chat            = require('./routes/chat');
var app             = express();
var server          = require('http').createServer(app);
var io              = require('socket.io')(server);
var port            = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
// Routing

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/chat', chat);
app.use(express.static(__dirname + '/public'));
// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
    var remoteAddress = socket.client.conn.remoteAddress.split(':').pop();
    var addedUser = false;
    console.log(remoteAddress + ' connected');

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            otherUsername: socket.otherUsername,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;
            console.log(remoteAddress + ' left');
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});
