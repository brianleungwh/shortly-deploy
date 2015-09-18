var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
  username: {
    type: String
  },
  password: {
    type: String
  }
});

UserSchema.pre('save', true, function (next, done) {
  this.hashPassword().then(function () {
    next();
    done(); 
  });
});

UserSchema.methods.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    console.log('bcrypt.compare error: ' + err);
    console.log('compare\'s evaluation match?: ' + isMatch);
    callback(isMatch);
  });
};

UserSchema.methods.hashPassword = function(){
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      console.log(hash);
      this.password = hash;
    });
}

var User = mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');