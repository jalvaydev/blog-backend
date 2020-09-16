/* eslint-disable no-throw-literal */
const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  const list = await User
    .find({}).populate('blogs', { url: 1, title: 1, name: 1 });

  response.json(list.map((user) => user.toJSON()));
});

usersRouter.post('/', async (request, response) => {
  try {
    const { body } = request;

    if (body.password.length < 3) {
      throw '`password` must be at least 3 characters';
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    });

    const savedUser = await user.save();

    response.json(savedUser);
  } catch (error) {
    response.status(400).json({ error });
  }
});

module.exports = usersRouter;
