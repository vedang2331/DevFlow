import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('DevFlow API Health & Public Endpoints', () => {
  it('GET /health should return 200 OK with operational status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('POST /api/v1/auth/login with missing fields should return 422 Validation Error', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'invalid-email',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/v1/organizations without token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/organizations');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });
});
