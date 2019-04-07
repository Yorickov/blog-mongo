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
  Tag,
  mongoose,
} = container;

const userTest = {
  _id: new container.mongoose.Types.ObjectId(),
  firstName: faker.name.lastName(),
  lastName: faker.name.firstName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

const categoryTest = {
  _id: new container.mongoose.Types.ObjectId(),
  name: 'sport',
};

const postTest = {
  title: faker.lorem.word(),
  annotation: faker.lorem.word(),
  content: faker.lorem.word(),
  tagsIn: 'php, js',
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
  });

  beforeEach(async () => {
    server = app().listen();
    const auth = await request.agent(server)
      .post('/sessions')
      .type('form')
      .send({ form: { email: userTest.email, password: userTest.password } });
    cookie = auth.headers['set-cookie'];
  });

  it('CRUD tag', async () => {
    await request.agent(server)
      .post('/posts')
      .type('form')
      .set('Cookie', cookie)
      .send({ form: { ...postTest, category: category.id } });
    const cnt = await Tag.countDocuments();
    expect(cnt).toEqual(2);

    const post = await Post.findOne({ title: postTest.title });

    await request.agent(server)
      .patch(`/posts/${post.id}/update`)
      .type('form')
      .set('Cookie', cookie)
      .send({ form: { ...postTest, category: category.id, tagsIn: 'ruby' } });
    // const cnt = await Tag.countDocuments();
    // expect(cnt).toEqual(1);
    const postUp = await Post.findOne({ title: postTest.title });
    expect(postUp.tags).toHaveLength(1);
    expect(postUp.tags[0].name).toMatch('ruby');
    const tag = await Tag.findOne({ name: 'ruby' });
    expect(tag.posts[0].title).toMatch(postTest.title);

    await request.agent(server)
      .delete(`/posts/${post.id}/destroy`)
      .set('Cookie', cookie);
    const tagDel = await Tag.findOne({ name: 'ruby' });
    expect(tagDel.posts).toHaveLength(0);
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await server.close();
  });
});
