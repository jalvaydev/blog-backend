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

blogsRouter.post('/', async (request, response) => {
  try {
    const { body } = request;

    const decodedToken = jwt.verify(request.token, process.env.SECRET);

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' });
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
  } catch (error) { return response.status(400).json({ error }).end(); }
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
  const blogToDelete = await Blog.findById(request.params.id);

  const decodedToken = jwt.verify(request.token, process.env.SECRET);

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  try {
    if (blogToDelete.user.toString() === decodedToken.id.toString()) {
      await Blog.findByIdAndRemove(request.params.id);
      response.status(204).end();
    } else {
      return response.json(401).json({ error: 'a blog can only be deleted by the user who added it' });
    }
  } catch (error) {
    response.status(400).json(error).end();
  }
});

module.exports = blogsRouter;
