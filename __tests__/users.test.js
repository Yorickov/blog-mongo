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

  it('Create user', async () => {
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: userTest });
    expect(res).toHaveHTTPStatus(302);
    const cnt = await User.countDocuments();
    expect(cnt).toEqual(1);
  });

  it('Error create user', async () => {
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: { ...userTest, firstName: '' } });
    expect(res).toHaveHTTPStatus(422);
  });

  it('Edit user form', async () => {
    const resIn = await request.agent(server)
      .post('/sessions')
      .type('form')
      .send({ form: { email: userTest.email, password: userTest.password } });
    expect(resIn).toHaveHTTPStatus(302);

    const cookie = resIn.headers['set-cookie'];
    const resEdit = await request.agent(server)
      .get('/account/edit')
      .set('Cookie', cookie);
    expect(resEdit).toHaveHTTPStatus(200);
  });

  it('Show user', async () => { // ERROR show user !!!!
    const user = await User.findOne({ email: userTest.email });
    const resIn = await request.agent(server)
      .post('/sessions')
      .type('form')
      .send({ form: { email: userTest.email, password: userTest.password } });

    const cookie = resIn.headers['set-cookie'];
    const resErr = await request.agent(server)
      .set('Cookie', cookie)
      .get('/users/444');
    expect(resErr).toHaveHTTPStatus(404);

    const resOut = await request.agent(server)
      .set('Cookie', cookie)
      .get(`/users/${user.id}`);
    expect(resOut).toHaveHTTPStatus(200);
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await server.close();
  });
});
