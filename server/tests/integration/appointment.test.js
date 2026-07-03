// tests/integration/appointment.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Doctor = require('../../src/models/Doctor');
const { hashPassword } = require('../../src/utils/hashPassword');

// Test helpers
const setupTestData = async () => {
  const adminUser = await User.create({
    name: 'Admin', email: 'admin@appt.test',
    role: 'admin', password: await hashPassword('Admin@123'),
  });
  const doctorUser = await User.create({
    name: 'Dr. Appt', email: 'doctor@appt.test',
    role: 'doctor', password: await hashPassword('Doctor@123'),
  });
  const patientUser = await User.create({
    name: 'Patient One', email: 'patient@appt.test',
    role: 'patient', firebaseUid: 'test_firebase_uid_appt',
  });

  const testDate = '2024-12-25';
  const slotsMap = new Map();
  slotsMap.set(testDate, [
    { _id: new mongoose.Types.ObjectId(), startTime: '09:00', endTime: '09:15', isBooked: false, appointmentId: null },
    { _id: new mongoose.Types.ObjectId(), startTime: '09:15', endTime: '09:30', isBooked: false, appointmentId: null },
  ]);

  const doctor = await Doctor.create({
    userId: doctorUser._id,
    specialization: 'Cardiologist', qualification: 'MBBS',
    experience: 5, registrationNumber: 'MCI_APPT_001',
    consultationFee: 500, hospitalId: adminUser._id,
    availableDays: [0,1,2,3,4,5,6], // Sab din
    slots: slotsMap,
  });

  // Login tokens
  const doctorLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'doctor@appt.test', password: 'Doctor@123' });
  const adminLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@appt.test', password: 'Admin@123' });

  return {
    adminUser, doctorUser, patientUser, doctor,
    testDate,
    slots: slotsMap.get(testDate),
    doctorToken: doctorLoginRes.body.data?.token,
    adminToken: adminLoginRes.body.data?.token,
    patientId: patientUser._id,
  };
};

describe('Appointment API Integration Tests', () => {

  describe('Doctor Slot Generation', () => {
    test('doctor can generate slots for a date', async () => {
      const { doctorToken } = await setupTestData();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const res = await request(app)
        .post('/api/doctors/slots/generate')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ date: dateStr });

      expect(res.status).toBe(201);
      expect(res.body.data.totalSlots).toBeGreaterThan(0);
    });

    test('patient cannot generate slots', async () => {
      // Patient ka JWT manually banate hain
      const { generateAccessToken } = require('../../src/utils/generateToken');
      const { patientId } = await setupTestData();
      const patientToken = generateAccessToken({ id: patientId, role: 'patient', email: 'p@t.com' });

      const res = await request(app)
        .post('/api/doctors/slots/generate')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ date: '2024-12-25' });

      expect(res.status).toBe(403);  // Forbidden
    });
  });

  describe('Doctor Today Appointments', () => {
    test('doctor can view today appointments', async () => {
      const { doctorToken } = await setupTestData();

      const res = await request(app)
        .get('/api/doctors/appointments/today')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('appointments');
      expect(Array.isArray(res.body.data.appointments)).toBe(true);
    });
  });

  describe('Admin Bulk Cancel', () => {
    test('admin can bulk cancel by date', async () => {
      const { adminToken, doctor, testDate } = await setupTestData();

      const res = await request(app)
        .post('/api/admin/appointments/bulk-cancel')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          doctorId: doctor._id.toString(),
          date: testDate,
          reason: 'Doctor emergency leave',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('cancelledCount');
      expect(res.body.data).toHaveProperty('matchedCount');
    });

    test('admin bulk cancel requires at least doctorId or date', async () => {
      const { adminToken } = await setupTestData();

      const res = await request(app)
        .post('/api/admin/appointments/bulk-cancel')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' }); // No doctorId, no date

      expect(res.status).toBe(400);
    });

    test('non-admin cannot bulk cancel', async () => {
      const { doctorToken } = await setupTestData();

      const res = await request(app)
        .post('/api/admin/appointments/bulk-cancel')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ reason: 'Test', date: '2024-12-25' });

      expect(res.status).toBe(403);
    });
  });

  describe('Admin Stats', () => {
    test('admin can view hospital stats', async () => {
      const { adminToken } = await setupTestData();

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('users');
      expect(res.body.data).toHaveProperty('appointments');
    });
  });
});
