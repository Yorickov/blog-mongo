import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import MongoMemoryServer from 'mongodb-memory-server';
import faker from 'faker';

import encrypt from '../server/lib/encrypt';
import app from '../server';
import container from '../server/container';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000; //eslint-disable-line
const {
  User,
  Post,
  Category,
  mongoose,
} = container;

const categoryTest = {
  _id: new container.mongoose.Types.ObjectId(),
  name: 'sport',
};

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

const postTestUpdateForm = {
  title: faker.lorem.word(),
  annotation: postTest.annotation,
  content: faker.lorem.word(),
};

describe('posts handling', () => {
  let server;
  let mongoServer;
  let user; // eslint-disable-line
  let category; // eslint-disable-line
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
    user = await User.create({ ...userTest, password: encrypt(userTest.password) });
    await Category.create(categoryTest);
    category = await Category.findOne({ name: categoryTest.name });
    // await Category.create(
    //   { _id: mongoose.Types.ObjectId(), name: 'business' },
    //   { _id: mongoose.Types.ObjectId(), name: 'health' },
    //   { _id: mongoose.Types.ObjectId(), name: 'entertainment' },
    //   { _id: mongoose.Types.ObjectId(), name: 'sport' },
    //   { _id: mongoose.Types.ObjectId(), name: 'culture' },
    // );
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
      .send({ form: { ...postTest, category: category.id } });
    expect(postAdded).toHaveHTTPStatus(302);
    const cnt = await Post.countDocuments();
    expect(cnt).toEqual(1);

    const post = await Post.findOne({ title: postTest.title });
    expect(post.category.name).toMatch(categoryTest.name);

    const postErr = await request.agent(server)
      .get('/posts/444');
    expect(postErr).toHaveHTTPStatus(404);
    const postTrue = await request.agent(server)
      .get(`/posts/${post.id}`);
    expect(postTrue).toHaveHTTPStatus(200);

    const postUpdateForm = await request.agent(server)
      .get(`/posts/${post.id}/edit`)
      .set('Cookie', cookie);
    expect(postUpdateForm).toHaveHTTPStatus(200);

    const postUpdated = await request.agent(server)
      .patch(`/posts/${post.id}/update`)
      .type('form')
      .set('Cookie', cookie)
      .send({ form: { ...postTestUpdateForm, category: category.id } });
    expect(postUpdated).toHaveHTTPStatus(302);
    const isNewPost = await Post.findOne({ title: postTestUpdateForm.title });
    expect(isNewPost.content).toMatch(postTestUpdateForm.content);

    const postDeleteForm = await request.agent(server)
      .get(`/posts/${post.id}/destroy_edit`)
      .set('Cookie', cookie);
    expect(postDeleteForm).toHaveHTTPStatus(200);

    const postDelete = await request.agent(server)
      .delete(`/posts/${post.id}/destroy`)
      .set('Cookie', cookie);
    expect(postDelete).toHaveHTTPStatus(302);
    const cntUsr = await Post.countDocuments();
    expect(cntUsr).toEqual(0);
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await server.close();
  });
});
