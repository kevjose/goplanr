/**
 * Satellizer Node.js Example
 * (c) 2015 Sahat Yalkabov
 * License: MIT
 */

var path = require('path');
var qs = require('querystring');

var async = require('async');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var colors = require('colors');
var cors = require('cors');
var express = require('express');
var logger = require('morgan');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var request = require('request');

var config = require('./config');

var userSchema = new mongoose.Schema({
    email: {type: String, unique: true, lowercase: true},
    password: {type: String, select: false},
    displayName: String,
    picture: String
});

userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (password, done) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        done(err, isMatch);
    });
};

var User = mongoose.model('User', userSchema);
/**
 * Travel Model
 */
var travelSchema = new mongoose.Schema({
    title: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    createdBy: {type: String, required: true},
    locations: [{
        name: String,
        description: String,
        color: String,
        lat: String,
        lng: String
    }],
    travelMates: [String],
    discussions: [{
        message: {type: String, required: true},
        createdBy: {type: String, required: true},
        createdByEmail: {type: String, required: true},
        createdAt: {type: Date, default: Date.now}
    }]
});
var Travel = mongoose.model('Travel', travelSchema);

mongoose.connect(config.MONGO_URI);
mongoose.connection.on('error', function (err) {
    console.log('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
});

var app = express();
/**
 * Socket related
 */
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
io.sockets.on('connection', function (socket) {
    socket.on('send msg', function (data,res) {
        var discussionTosave = {
            message:data.message,
            createdBy:data.createdBy,
            createdByEmail:data.createdByEmail,
            createdAt:data.createdAt
        };
        Travel.findByIdAndUpdate(data.room,
            {
                $push: {
                    "discussions":discussionTosave
                }
            },
            {safe: true, upsert: true},
            function (err, travel) {
                if (err) {
                    console.log(err);
                    throw err;
                }else
                    io.sockets.in(data.room).emit('get msg', data);
            }
        );
        /*User.findById(req.user, function (err, user) {
         res.send(user);
         });*/
        //io.sockets.in(data.room).emit('get msg', data);
    });
    socket.on('room', function (room) {
        socket.join(room);
    });
    socket.on('leave-room', function (room) {
        socket.leave(room);
    });
});

app.set('port', process.env.PORT || 3000);
app.use(cors());
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
    app.use(function (req, res, next) {
        var protocol = req.get('x-forwarded-proto');
        protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
    });
}
app.use(express.static(path.join(__dirname, '/public')));

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({message: 'Please make sure your request has an Authorization header'});
    }
    var token = req.headers.authorization.split(' ')[1];

    var payload = null;
    try {
        payload = jwt.decode(token, config.TOKEN_SECRET);
    }
    catch (err) {
        return res.status(401).send({message: err.message});
    }

    if (payload.exp <= moment().unix()) {
        return res.status(401).send({message: 'Token has expired'});
    }
    req.user = payload.sub;
    next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}

/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */
app.get('/api/me', ensureAuthenticated, function (req, res) {
    User.findById(req.user, function (err, user) {
        res.send(user);
    });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
app.put('/api/me', ensureAuthenticated, function (req, res) {
    User.findById(req.user, function (err, user) {
        if (!user) {
            return res.status(400).send({message: 'User not found'});
        }
        user.displayName = req.body.displayName || user.displayName;
        user.email = req.body.email || user.email;
        user.save(function (err) {
            res.status(200).end();
        });
    });
});


/*
 |--------------------------------------------------------------------------
 | Log in with Email
 |--------------------------------------------------------------------------
 */
app.post('/auth/login', function (req, res) {
    User.findOne({email: req.body.email}, '+password', function (err, user) {
        if (!user) {
            return res.status(401).send({message: 'Wrong email and/or password'});
        }
        user.comparePassword(req.body.password, function (err, isMatch) {
            if (!isMatch) {
                return res.status(401).send({message: 'Wrong email and/or password'});
            }
            res.send({token: createJWT(user)});
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------------------------------
 */
app.post('/auth/signup', function (req, res) {
    User.findOne({email: req.body.email}, function (err, existingUser) {
        if (existingUser) {
            return res.status(409).send({message: 'Email is already taken'});
        }
        var user = new User({
            displayName: req.body.displayName,
            email: req.body.email,
            password: req.body.password
        });
        user.save(function () {
            res.send({token: createJWT(user)});
        });
    });
});

/**
 * Create Travel
 */
app.post('/api/travel/create', ensureAuthenticated, function (req, res) {
    var travel = new Travel({
        title: req.body.title,
        createdBy: req.body.createdBy,
        locations: req.body.locations,
        travelMates: req.body.travelMates
    });
    console.log(req.body.travelMates);
    travel.save(function (err, travel) {
        if (err)
            return res.status(400).send(err);
        return res.send(travel);
    });
});

/**
 * Fetch travel based on createdBy
 */
app.get('/api/travels/:travelMate/my-travels', ensureAuthenticated, function (req, res) {
    console.log(req.params.travelMate);
    Travel.find({travelMates: {"$in": [req.params.travelMate]}}, function (err, travel) {
        if (err)
            return res.status(400).send({message: 'no travels found'});
        return res.send(travel);
    });
});

/**
 * Fetch travel based on _id
 */
app.get('/api/travels/:id', ensureAuthenticated, function (req, res) {
    Travel.findOne({_id: req.params.id}, function (err, travel) {
        if (err)
            return res.status(400).send({message: 'no such travels found'});
        return res.send(travel);
    });
});

app.delete('/api/travels/delete/:id', function (req, res) {
    Travel.remove({_id: req.params.id}, function (err, travel) {
        if (err)
            return res.status(400).send({message: 'error'});

        // get and return all the todos after you create another
        return res.status(200).send({message: 'successfully deleted'});
    });
});

/*
 |--------------------------------------------------------------------------
 | Start the Server
 |--------------------------------------------------------------------------
 */
/*app.listen(app.get('port'), function () {
 console.log('Express server listening on port ' + app.get('port'));
 });*/
http.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});