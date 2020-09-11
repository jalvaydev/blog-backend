const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs.map((blog) => blog.toJSON()));
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
    const blog = new Blog(request.body);
    const savedBlog = await blog.save();

    response.json(savedBlog.toJSON());
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
