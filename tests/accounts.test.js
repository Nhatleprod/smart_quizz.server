const request = require('supertest');
const app = require('../src/app');
const { models } = require('../src/config/db.config');
const bcrypt = require('bcryptjs');

describe('Password Management', () => {
  let testAccount;
  let authToken;

  // Setup test data
  beforeAll(async () => {
    // Tạo tài khoản test
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    testAccount = await models.accounts.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      role: 'user',
      avatarURL: null
    });

    // Login để lấy token
    const loginRes = await request(app)
      .post('/api/accounts/login')
      .send({
        username: testAccount.username,
        password: 'Test123!'
      });

    authToken = loginRes.body.data.token;
  });

  // Cleanup test data
  afterAll(async () => {
    await models.accounts.destroy({
      where: { id: testAccount.id }
    });
  });

  // Test đổi mật khẩu
  describe('PUT /accounts/:id/password', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .put(`/api/accounts/${testAccount.id}/password`)
        .send({
          oldPassword: 'Test123!',
          newPassword: 'NewPass123!',
          confirmNewPassword: 'NewPass123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 when trying to change other user password', async () => {
      // Tạo tài khoản khác
      const otherAccount = await models.accounts.create({
        username: 'otheruser',
        email: 'other@example.com',
        passwordHash: await bcrypt.hash('Other123!', 10),
        role: 'user',
        avatarURL: null
      });

      const res = await request(app)
        .put(`/api/accounts/${otherAccount.id}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'Test123!',
          newPassword: 'NewPass123!',
          confirmNewPassword: 'NewPass123!'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);

      // Cleanup
      await models.accounts.destroy({
        where: { id: otherAccount.id }
      });
    });

    it('should change password successfully with valid credentials', async () => {
      const res = await request(app)
        .put(`/api/accounts/${testAccount.id}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'Test123!',
          newPassword: 'NewPass123!',
          confirmNewPassword: 'NewPass123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Đổi mật khẩu thành công');

      // Verify new password works
      const loginRes = await request(app)
        .post('/api/accounts/login')
        .send({
          username: testAccount.username,
          password: 'NewPass123!'
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });

    it('should validate old password', async () => {
      const res = await request(app)
        .put(`/api/accounts/${testAccount.id}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'WrongPass123!',
          newPassword: 'NewPass123!',
          confirmNewPassword: 'NewPass123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate password requirements', async () => {
      const res = await request(app)
        .put(`/api/accounts/${testAccount.id}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'NewPass123!',
          newPassword: 'weak',
          confirmNewPassword: 'weak'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should require matching passwords', async () => {
      const res = await request(app)
        .put(`/api/accounts/${testAccount.id}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'NewPass123!',
          newPassword: 'NewPass123!',
          confirmNewPassword: 'DifferentPass123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
}); 