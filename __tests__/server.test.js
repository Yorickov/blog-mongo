import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import app from '../server';

describe('requests', () => {
  let server;

  beforeAll(() => {
    expect.extend(matchers);
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('root', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('wrong root', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });

  it('Show forms users', async () => { // add postst, etc.
    const res = await request.agent(server)
      .get('/users/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('Signing in form', async () => {
    const res = await request.agent(server)
      .get('/sessions/new');
    expect(res).toHaveHTTPStatus(200);
  });

  afterEach(async () => {
    await server.close();
  });
});
