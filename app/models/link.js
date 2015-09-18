var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var LinkSchema = new Schema({
  url: {
    type: String
  },
  base_url: {
    type: String
  },
  code: {
    type: String
  },
  title: {
    type: String
  },
  visits: {
    default: 0,
    type: Number
  }
});

LinkSchema.pre('save', true, function (next, done) {
  if (!this.code) {
    var shasum = crypto.createHash('sha1');
    shasum.update(this.url);
    this.code = shasum.digest('hex').slice(0, 5);
  }
  next();
  done();
});

var Link = mongoose.model('Link', LinkSchema);

module.exports = mongoose.model('Link');