const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');

const app = express();

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.log('Error connecting to MongoDB', error.message);
});

app.use(cors());
app.use(express.json());

app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);

module.exports = app;
