import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import MongoMemoryServer from 'mongodb-memory-server';
import faker from 'faker';

import encrypt from '../server/lib/encrypt';
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

describe('sessions handling', () => {
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

  it('Sign out', async () => {
    await User.create({ ...userTest, password: encrypt(userTest.password) });
    const resIn = await request.agent(server)
      .post('/sessions')
      .type('form')
      .send({ form: { email: userTest.email, password: userTest.password } });
    expect(resIn).toHaveHTTPStatus(302);

    const cookie = resIn.headers['set-cookie'];
    const resOut = await request.agent(server)
      .set('Cookie', cookie)
      .delete('/sessions');
    expect(resOut).toHaveHTTPStatus(302);
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await server.close();
  });
});
