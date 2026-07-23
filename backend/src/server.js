const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

const DB = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/car-dealership';
const PORT = process.env.PORT || 5000;

mongoose.connect(DB)
  .then(() => {
    console.log('DB connection successful!');
    app.listen(PORT, () => {
      console.log(`App running on port ${PORT}...`);
    });
  })
  .catch(err => {
    console.error('DB connection error:', err);
    process.exit(1);
  });
