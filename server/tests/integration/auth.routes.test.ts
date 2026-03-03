import request from 'supertest';
import { createApp } from '../../src/app';

jest.mock('../../src/services/authService', () => ({
  authService: {
    register: jest.fn(async () => ({
      user: {
        id: 'u1',
        email: 'user@example.com',
        username: 'user',
        role: 'VIEWER',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    })),
    login: jest.fn(async () => ({
      user: {
        id: 'u1',
        email: 'user@example.com',
        username: 'user',
        role: 'VIEWER',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    })),
    refresh: jest.fn(async () => ({
      user: {
        id: 'u1',
        email: 'user@example.com',
        username: 'user',
        role: 'VIEWER',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      },
    })),
  },
}));

describe('Auth routes', () => {
  const app = createApp();

  it('supports register', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'user@example.com',
        username: 'user',
        password: 'StrongPassword!123',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens.accessToken).toBe('access-token');
  });

  it('supports login', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'StrongPassword!123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('supports refresh', async () => {
    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'refresh-token' });

    expect(response.status).toBe(200);
    expect(response.body.data.tokens.accessToken).toBe('new-access');
  });
});
