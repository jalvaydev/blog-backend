const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const helper = require('./test_helper');
const Blog = require('../models/blog');
const User = require('../models/user');

const api = supertest(app);

describe('there are existing blog posts saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogList = helper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogList.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  test('all blog posts are returned', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('blogs have a unique property: id ', async () => {
    const response = await api.get('/api/blogs');

    const exampleBlog = response.body[0];

    expect(exampleBlog.id).toBeDefined();
  });
});

describe('viewing a specific blog post', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
  });

  test('succeed if valid blog id', async () => {
    const blog = helper.initialBlogs[0];

    const savedBlog = await api
      .post('/api/blogs')
      .send(blog);

    await api
      .get(`/api/blogs/${savedBlog.body.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
});

describe('creation of new blog posts', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
  });

  test('new blog post is successfully created', async () => {
    const blog = helper.initialBlogs[0];

    await api
      .post('/api/blogs')
      .send(blog)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('likes will default to 0 if not specified', async () => {
    const blog = {
      title: 'A story about bao',
      author: 'Wise Panda',
      url: 'www.savethepanda.com',
    };

    const response = await api.post('/api/blogs').send(blog);
    expect(response.body.likes).toBe(0);
  });

  test('check for status code 400 if title and url are missing', async () => {
    const blog = {
      author: 'Wise Panda',
    };

    await api
      .post('/api/blogs')
      .send(blog)
      .expect(400);
  });
});

describe('modifying an existing blog post', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    const blog = helper.initialBlogs[0];
    await api.post('/api/blogs').send(blog);
  });
  test('successfully updating the amount of likes', async () => {
    const response = await api.get('/api/blogs');

    const blog = response.body[0];

    const newBlog = {
      likes: (blog.likes + 1),
    };

    const updatedBlog = await api.put(`/api/blogs/${blog.id}`).send(newBlog);
    expect(updatedBlog.body.likes).toBe(blog.likes + 1);
  });
});

describe('deletion of a blog post', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    const blog = helper.initialBlogs[0];
    await api.post('/api/blogs').send(blog);
  });
  test('successfully delete a blog post', async () => {
    const response = await api.get('/api/blogs');
    const blog = response.body[0];
    await api
      .delete(`/api/blogs/${blog.id}`)
      .expect(204);

    const responseAtEnd = await api.get('/api/blogs');
    expect(responseAtEnd.body).toHaveLength(0);
  });
});

describe('creation of a user account', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('successful creation of a user account', async () => {
    const newUser = {
      username: 'wisepanda',
      name: 'Wise Panda',
      password: 'securepassword',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
});

describe('there are existing users in the database', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('secret', 10);
    const user = new User({ username: 'tester', passwordHash });

    await user.save();
  });

  test('viewing all users', async () => {
    const response = await api.get('/api/users');
    expect(response.body).toHaveLength(1);
  });
});

describe('user creation', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('creating a user with the same username', async () => {
    const passwordHash = await bcrypt.hash('secret', 10);
    const user = new User({ username: 'tester', passwordHash });

    await user.save();

    const newUser = {
      username: 'tester',
      name: 'Tester One',
      password: 'moresecret',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('`username` to be unique');
  });

  test('failure to create user if pass/user is less than 3 char', async () => {
      
  })
});

afterAll(() => {
  mongoose.connection.close();
});
