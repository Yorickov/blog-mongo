import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import MongoMemoryServer from 'mongodb-memory-server';
import faker from 'faker';

import encrypt from '../server/lib/encrypt';
import app from '../server';
import container from '../server/container';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000; //eslint-disable-line
const { User, Post, mongoose } = container;

const userTest = {
  _id: new container.mongoose.Types.ObjectId(),
  firstName: faker.name.lastName(),
  lastName: faker.name.firstName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

const postTest = {
  _id: new container.mongoose.Types.ObjectId(),
  title: faker.lorem.word(),
  annotation: faker.lorem.word(),
  content: faker.lorem.word(),
};

describe('posts handling', () => {
  let server;
  let mongoServer;
  let user; // eslint-disable-line
  let cookie;

  beforeAll(async () => {
    expect.extend(matchers);
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
    }, (err) => {
      if (err) console.error(err);
    });
    user = User.create({ ...userTest, password: encrypt(userTest.password) });
  });

  beforeEach(async () => {
    server = app().listen();
    const auth = await request.agent(server)
      .post('/sessions')
      .type('form')
      .send({ form: { email: userTest.email, password: userTest.password } });
    cookie = auth.headers['set-cookie'];
  });

  it('root', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('CRUD post', async () => {
    const postForm = await request.agent(server)
      .get('/posts/new')
      .set('Cookie', cookie);
    expect(postForm).toHaveHTTPStatus(200);

    const postAdded = await request.agent(server)
      .post('/posts')
      .type('form')
      .set('Cookie', cookie)
      .send({ form: postTest });
    expect(postAdded).toHaveHTTPStatus(302);
    const cnt = await Post.countDocuments();
    expect(cnt).toEqual(1);

    const post = await Post.findOne({ title: postTest.title });
    const postErr = await request.agent(server)
      .get('/posts/444');
    expect(postErr).toHaveHTTPStatus(404);
    const postTrue = await request.agent(server)
      .get(`/posts/${post.id}`);
    expect(postTrue).toHaveHTTPStatus(200);
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await server.close();
  });
});
