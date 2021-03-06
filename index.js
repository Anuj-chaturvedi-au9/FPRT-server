const express = require('express');
const app = express();
const config = require('./config/config.json');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const expsession = require("express-session")
// Passport
const passport = require('passport');
require('./middleware/passport')(passport);
// Socket IO
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const socketsBoard = require('./sockets/board');



// middleware
app.use(express.json());
app.use(express-session(""))

// Express session
app.use(
  session({
    secret: process.env.secret || config.secret,
    // resave: true,
		// saveUninitialized: true,
		saveUninitialized: false,
    resave: false
  })

  var store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
  collection: 'mySessions'
});
);

bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password,  function(err, hash) {
        // Store hash in your password DB.
    });
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connect
const MongoURI = process.env.MongoURI || config.MongoURI;

mongoose.set('useCreateIndex', true);
mongoose.connect(MongoURI, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true  })
	.then(() => {
		console.log('Connected to MongoDB...');
	})
	.catch((err) => {
		console.error('Enable to connect to MongoDB', err);
	});


// Routes
app.use('/api/users', require('./api/routes/users'));
app.use('/api/boards', require('./api/routes/boards'));
app.use('/api/participants', require('./api/routes/participants'));
app.use('/api/lists', require('./api/routes/lists'));
app.use('/api/cards', require('./api/routes/cards'));


// Socket IO
io.on('connection', (socket) => {	
	// enter room (board)
	socket.on('enter-board-room', (data) => {
		socketsBoard.enterBoard(io, socket, data);
	});

	// leave room (board)
	socket.on('leave-board-room', (data) => {
		socketsBoard.leaveBoard(io, socket, data);
	});

	// update board for other participants
	socket.on('update-board-room', (data) => {
		socketsBoard.updateBoard(io, socket, data);
	});

	// notify single participant 
	socket.on('notify-board-room-participant', (data) => {
		socketsBoard.notifyParticipant(io, socket, data);
	});

	// notify all participants 
	socket.on('notify-board-room-all-participants', (data) => {
		socketsBoard.notifyAllParticipants(io, socket, data);
	});
});

// Server
const PORT = process.env.PORT || config.PORT;

if (process.env.NODE_ENV === 'production') {
	app.use(express.static('./client/build'));

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

http.listen(PORT, () => {
	console.log(`Server started on port: ${PORT}`);
});

