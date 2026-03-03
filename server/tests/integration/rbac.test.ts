import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { env } from '../../src/config/env';
import { authenticate } from '../../src/middleware/authenticate';
import { authorize } from '../../src/middleware/authorize';
import { errorHandler } from '../../src/middleware/errorHandler';
import { UserRole } from '../../src/types';

function buildTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/admin-only', authenticate, authorize([UserRole.ADMIN]), (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use(errorHandler);
  return app;
}

describe('RBAC middleware', () => {
  const app = buildTestApp();

  const signToken = (role: UserRole) =>
    jwt.sign(
      {
        userId: 'u1',
        email: 'user@example.com',
        role,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '10m' },
    );

  it('allows authorized role', async () => {
    const response = await request(app)
      .get('/admin-only')
      .set('Authorization', `Bearer ${signToken(UserRole.ADMIN)}`);

    expect(response.status).toBe(200);
  });

  it('blocks unauthorized role', async () => {
    const response = await request(app)
      .get('/admin-only')
      .set('Authorization', `Bearer ${signToken(UserRole.VIEWER)}`);

    expect(response.status).toBe(403);
  });
});
