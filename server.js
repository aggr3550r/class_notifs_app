const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('unhandledException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    /*Commented out the option specifications below because they had become outdated in Mongoose 6.0*/

    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then(() => console.log('DB Connection Successful!'));

const app = require('./app');

// console.log(process.env);

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
