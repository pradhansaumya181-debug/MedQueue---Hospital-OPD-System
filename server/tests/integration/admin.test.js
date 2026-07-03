// tests/integration/admin.test.js
const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const { hashPassword } = require('../../src/utils/hashPassword');

const getAdminToken = async () => {
  await User.create({
    name: 'Admin Test', email: 'admin.test@admin.com',
    role: 'admin', password: await hashPassword('Admin@123'),
  });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin.test@admin.com', password: 'Admin@123' });
  return res.body.data?.token;
};

describe('Admin API Tests', () => {

  describe('GET /api/admin/users', () => {
    test('admin can list all users', async () => {
      const token = await getAdminToken();
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.users).toBeDefined();
      expect(res.body.data.pagination).toBeDefined();
    });

    test('admin can filter users by role', async () => {
      const token = await getAdminToken();
      const res = await request(app)
        .get('/api/admin/users?role=admin')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      res.body.data.users.forEach(u => expect(u.role).toBe('admin'));
    });

    test('non-admin cannot list users', async () => {
      // Doctor token
      await User.create({
        name: 'Dr. Access', email: 'dr.access@test.com',
        role: 'doctor', password: await hashPassword('Doctor@123'),
      });
      const docRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'dr.access@test.com', password: 'Doctor@123' });
      const docToken = docRes.body.data?.token;

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${docToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/admin/users/:id/toggle-block', () => {
    test('admin can block a user', async () => {
      const token = await getAdminToken();

      // Target user banao
      const targetUser = await User.create({
        name: 'Block Target', email: 'blocktarget@test.com',
        role: 'patient', firebaseUid: 'block_target_uid',
      });

      const res = await request(app)
        .patch(`/api/admin/users/${targetUser._id}/toggle-block`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.isBlocked).toBe(true);
    });

    test('admin cannot block themselves', async () => {
      const token = await getAdminToken();
      const adminUser = await User.findOne({ email: 'admin.test@admin.com' });

      const res = await request(app)
        .patch(`/api/admin/users/${adminUser._id}/toggle-block`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('yourself');
    });
  });
});
