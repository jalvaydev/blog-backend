/* eslint-disable no-underscore-dangle */
const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.json(blog.toJSON());
  } else {
    response.status(404).end();
  }
});

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }

  return null;
};

blogsRouter.post('/', async (request, response) => {
  try {
    const { body } = request;

    const token = getTokenFrom(request);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing of invalid' });
    }

    const user = await User.findById(decodedToken.id);
    console.log(user);

    const blog = new Blog({
      url: body.url,
      title: body.title,
      name: body.name,
      user: user._id,
      likes: body.likes,
    });

    const savedBlog = await blog.save();

    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    response.json(savedBlog).status(200);
  } catch { return response.status(400).end(); }
});

blogsRouter.put('/:id', async (request, response) => {
  const { body } = request;

  const updatedBlog = await Blog
    .findByIdAndUpdate(request.params.id,
      { likes: body.likes },
      { new: true });

  response.json(updatedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } catch {
    response.status(400);
  }
});

module.exports = blogsRouter;
