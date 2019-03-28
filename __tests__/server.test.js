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

  it('GET / 200', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET / 404', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });

  it('GET /users/new 200', async () => {
    const res = await request.agent(server)
      .get('/users/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /sessions/new 200', async () => {
    const res = await request.agent(server)
      .get('/sessions/new');
    expect(res).toHaveHTTPStatus(200);
  });

  afterEach(async () => {
    await server.close();
  });
});
