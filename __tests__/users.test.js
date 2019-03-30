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
const newUserTest = {
  ...userTest,
  firstName: faker.name.lastName(),
  lastName: faker.name.firstName(),
};
const newEmail = faker.internet.email();
const newPassword = faker.internet.password();

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

  it('CRUD user', async () => {
    const validErr = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: { ...userTest, firstName: '' } });
    expect(validErr).toHaveHTTPStatus(422);

    const userCreated = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: userTest });
    expect(userCreated).toHaveHTTPStatus(302);
    const cnt = await User.countDocuments();
    expect(cnt).toEqual(1);

    const signInErr = await request.agent(server)
      .post('/sessions')
      .type('form')
      .send({ form: { email: 'wrong@marr.com', password: 'wrong' } });
    expect(signInErr).toHaveHTTPStatus(422);

    const signIn = await request.agent(server)
      .post('/sessions')
      .type('form')
      .send({ form: { email: userTest.email, password: userTest.password } });
    expect(signIn).toHaveHTTPStatus(302);

    const cookie = signIn.headers['set-cookie'];

    const user = await User.findOne({ email: userTest.email });
    const profileErr = await request.agent(server)
      .get('/users/444')
      .set('Cookie', cookie);
    expect(profileErr).toHaveHTTPStatus(404);

    const profile = await request.agent(server)
      .get(`/users/${user.id}`)
      .set('Cookie', cookie);
    expect(profile).toHaveHTTPStatus(200);

    const profileUpdateForm = await request.agent(server)
      .get('/account/edit')
      .set('Cookie', cookie);
    expect(profileUpdateForm).toHaveHTTPStatus(200);

    const profileUpdated = await request.agent(server)
      .patch('/account/profile')
      .type('form')
      .set('Cookie', cookie)
      .send({ form: { firstName: newUserTest.firstName, lastName: newUserTest.lastName } });
    expect(profileUpdated).toHaveHTTPStatus(302);
    const isNewProfile = await User.findOne({ email: newUserTest.email });
    expect(isNewProfile.firstName).toMatch(newUserTest.firstName);

    const emailUpdated = await request.agent(server)
      .patch('/account/email')
      .type('form')
      .set('Cookie', cookie)
      .send({ form: { email: newEmail } });
    expect(emailUpdated).toHaveHTTPStatus(302);
    const isNewEmail = await User.findOne({ email: newEmail });
    expect(isNewEmail.firstName).toMatch(newUserTest.firstName);

    const passUpdatedForm = await request.agent(server)
      .get('/account/password_edit')
      .set('Cookie', cookie);
    expect(passUpdatedForm).toHaveHTTPStatus(200);

    const passUpdated = await request.agent(server)
      .patch('/account/password')
      .type('form')
      .set('Cookie', cookie)
      .send({ form: { password: newPassword, oldPassword: userTest.password } });
    expect(passUpdated).toHaveHTTPStatus(302);
    const isNewPass = await User.findOne({ email: newEmail });
    expect(isNewPass.password).toMatch(encrypt(newPassword));

    const accDeleteForm = await request.agent(server)
      .get('/account/destroy')
      .set('Cookie', cookie);
    expect(accDeleteForm).toHaveHTTPStatus(200);

    const accDelete = await request.agent(server)
      .delete('/account')
      .type('form')
      .set('Cookie', cookie)
      .send({ form: { password: newPassword } });
    expect(accDelete).toHaveHTTPStatus(302);
    const cntUsr = await User.countDocuments();
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
