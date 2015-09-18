var url = 'mongodb://localhost:27017/shortlydb';

if (process.env.NODE_ENV === 'production') {
  url: 'mongodb://MongoLab-BetterThanBitly:HackReactor@ds042698.mongolab.com:42698/MongoLab-BetterThanBitly'
}

module.exports = {
  url: url
};