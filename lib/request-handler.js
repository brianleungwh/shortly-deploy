var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var config = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

var mongoose = require('mongoose');

// Connecting to the local MongoDB
mongoose.connect(config.url);
var db = mongoose.connection;
db.on('error', function (error) {
  console.log('There was an error connecting to MongoDB: ' + error);
});
db.once('open', function () {
  console.log('Connection established');
})

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  // Gather all model instances from Link
  Link.find().exec(function (err, links) {
    if (err) {
      console.log('Error with fetchLinks: ' + err);
      res.send(404);
    } else {
      res.send(200, links);
    }
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({url: uri}).exec(function(err, link) {
    if (err) {
      console.log('Error with saveLink: ' + err);
      return res.send(404);
    }
    if (link) {
      res.send(200, link);
    } else {
      util.getUrlTitle(uri, function (err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });
        newLink.save(function (err, link) {
          if (err) {
            console.log('Error saving new link: ' + err);
            return res.send(404);
          }
          console.log(link);
          res.send(200, link);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}).exec(function (err, user) {
    if (err) {
      console.log('Error with loginUser: ' + err);
      return res.send(404);
    }
    console.log('============ User.findOne ============');
    console.log(user);
    if (!user) {
      console.log('There is no user');
      res.redirect('/login');
    } else {
      console.log('there is user');
      user.comparePassword(password, function(match) {
        if (match) {
          console.log('Password matched!');
          util.createSession(req, res, user);
        } else {
          console.log('Password incorrect!');
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}).exec(function (err, user) {
    if (err) {
      console.log('Error with loginUser: ' + err);
      return res.send(404);
    }
    if (user) {
      console.log('Account already exists');
      res.redirect('/signup');
    } else {
      var newUser = new User({
        username: username,
        password: password
      });
      newUser.save(function (err, user) {
        if (err) {
          console.log('Error saving new user: ' + err);
          return res.send(404);
        }
        util.createSession(req, res, user);
      });
    }
  });
};

exports.navToLink = function(req, res) {
  Link.findOne({code: req.params[0]}).exec(function(err, link) {
    if (err) {
      console.log('Error at navToLink: ' + err);
      return res.send(404);
    }
    if (!link) {
      res.redirect('/');
    } else {
      link.visits += 1;
      link.save(function(err, link) {
        if (err) {
          console.log('Failed at saving link: ' + err);
          return res.send(404);
        }
        res.redirect(link.url);
      });
    }
  });
};