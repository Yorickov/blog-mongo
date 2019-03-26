import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import MongoMemoryServer from 'mongodb-memory-server';
import faker from 'faker';

import app from '../server';
import container from '../server/container';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000; //eslint-disable-line
const { User, log, mongoose } = container;

const userTest = {
  nickname: faker.name.lastName(),
  password: faker.internet.password(),
};

describe('requests', () => {
  let server;

  beforeAll(() => {
    expect.extend(matchers);
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('GET 200', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET 404', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});

describe('db handling', () => {
  let server;
  let mongoServer;

  beforeAll(async () => {
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

  it('add user in db', async () => {
    const user = new User(userTest);
    await user.save();
    log('Added in DB', userTest);
    const cnt = await User.countDocuments();
    expect(cnt).toEqual(1);
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
