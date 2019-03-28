import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import MongoMemoryServer from 'mongodb-memory-server';
import faker from 'faker';

import app from '../server';
import container from '../server/container';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000; //eslint-disable-line
const { User, mongoose } = container;

const userTest = {
  _id: new container.mongoose.Types.ObjectId(),
  firstName: faker.name.lastName(),
  lastName: faker.name.firstName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

describe('users handling', () => {
  let server;
  let mongoServer;

  beforeAll(async () => {
    expect.extend(matchers);
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
    }, (err) => {
      if (err) console.error(err);
    });
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('POST /users 302', async () => {
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: userTest });
    expect(res).toHaveHTTPStatus(302);
    const cnt = await User.countDocuments();
    expect(cnt).toEqual(1);
  });

  it('POST /users 422', async () => {
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: { ...userTest, firstName: '' } });
    expect(res).toHaveHTTPStatus(422);
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await server.close();
  });
});
