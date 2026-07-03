// tests/unit/bookingService.test.js
// Sabse important tests — conflict prevention verify karo

const mongoose = require('mongoose');
const { hashPassword } = require('../../src/utils/hashPassword');
const User = require('../../src/models/User');
const Doctor = require('../../src/models/Doctor');
const Appointment = require('../../src/models/Appointment');
const { bookSlot } = require('../../src/services/bookingService');

// Test data setup helper
const createTestData = async () => {
  // Patient user
  const patient1 = await User.create({
    name: 'Patient One',
    email: 'patient1@test.com',
    role: 'patient',
    firebaseUid: 'firebase_uid_1',
  });

  const patient2 = await User.create({
    name: 'Patient Two',
    email: 'patient2@test.com',
    role: 'patient',
    firebaseUid: 'firebase_uid_2',
  });

  // Doctor user
  const doctorUser = await User.create({
    name: 'Dr. Test',
    email: 'doctor@test.com',
    role: 'doctor',
    password: await hashPassword('Doctor@123'),
  });

  const adminUser = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    role: 'admin',
    password: await hashPassword('Admin@123'),
  });

  // Doctor profile with pre-set slots
  const testDate = '2024-06-15';
  const slotsMap = new Map();
  slotsMap.set(testDate, [
    {
      _id: new mongoose.Types.ObjectId(),
      startTime: '09:00',
      endTime: '09:15',
      isBooked: false,
      appointmentId: null,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      startTime: '09:15',
      endTime: '09:30',
      isBooked: false,
      appointmentId: null,
    },
  ]);

  const doctor = await Doctor.create({
    userId: doctorUser._id,
    specialization: 'Cardiologist',
    qualification: 'MBBS, MD',
    experience: 10,
    registrationNumber: 'MCI123456',
    consultationFee: 500,
    hospitalId: adminUser._id,
    slots: slotsMap,
  });

  return { patient1, patient2, doctor, testDate, slots: slotsMap.get(testDate) };
};

describe('Booking Service — Conflict Prevention', () => {

  test('should successfully book an available slot', async () => {
    const { patient1, doctor, testDate, slots } = await createTestData();

    const appointment = await bookSlot({
      patientId: patient1._id,
      doctorId: doctor._id,
      date: testDate,
      slotId: slots[0]._id.toString(),
      reason: 'Chest pain checkup',
    });

    // Appointment bana?
    expect(appointment).toBeTruthy();
    expect(appointment.status).toBe('confirmed');
    expect(appointment.tokenNumber).toBe(1);  // Pehla token

    // Slot booked mark hua?
    const updatedDoctor = await Doctor.findById(doctor._id);
    const updatedSlot = updatedDoctor.slots.get(testDate)[0];
    expect(updatedSlot.isBooked).toBe(true);
    expect(updatedSlot.appointmentId.toString()).toBe(appointment._id.toString());
  });

  test('should prevent double booking of same slot', async () => {
    const { patient1, patient2, doctor, testDate, slots } = await createTestData();
    const slotId = slots[0]._id.toString();

    // Patient 1 book kare
    await bookSlot({
      patientId: patient1._id,
      doctorId: doctor._id,
      date: testDate,
      slotId,
      reason: 'First booking',
    });

    // Patient 2 same slot book karne ki koshish kare — FAIL HONA CHAHIYE
    await expect(
      bookSlot({
        patientId: patient2._id,
        doctorId: doctor._id,
        date: testDate,
        slotId,
        reason: 'Second booking attempt',
      })
    ).rejects.toThrow('Slot is no longer available');
  });

  test('should allow booking different slots on same date', async () => {
    const { patient1, patient2, doctor, testDate, slots } = await createTestData();

    // Patient 1 pehla slot le
    const booking1 = await bookSlot({
      patientId: patient1._id,
      doctorId: doctor._id,
      date: testDate,
      slotId: slots[0]._id.toString(),
      reason: 'First patient',
    });

    // Patient 2 doosra slot le — SUCCESS HONA CHAHIYE
    const booking2 = await bookSlot({
      patientId: patient2._id,
      doctorId: doctor._id,
      date: testDate,
      slotId: slots[1]._id.toString(),
      reason: 'Second patient',
    });

    expect(booking1.tokenNumber).toBe(1);
    expect(booking2.tokenNumber).toBe(2);  // Dono alag tokens
    expect(booking1.slotId.toString()).not.toBe(booking2.slotId.toString());
  });

  test('should assign incrementing token numbers', async () => {
    const { patient1, patient2, doctor, testDate, slots } = await createTestData();

    const b1 = await bookSlot({
      patientId: patient1._id,
      doctorId: doctor._id,
      date: testDate,
      slotId: slots[0]._id.toString(),
      reason: 'First',
    });

    const b2 = await bookSlot({
      patientId: patient2._id,
      doctorId: doctor._id,
      date: testDate,
      slotId: slots[1]._id.toString(),
      reason: 'Second',
    });

    // Tokens sequential hone chahiye
    expect(b1.tokenNumber).toBe(1);
    expect(b2.tokenNumber).toBe(2);
  });

  test('should throw error for non-existent slot', async () => {
    const { patient1, doctor, testDate } = await createTestData();
    const fakeSlotId = new mongoose.Types.ObjectId().toString();

    await expect(
      bookSlot({
        patientId: patient1._id,
        doctorId: doctor._id,
        date: testDate,
        slotId: fakeSlotId,
        reason: 'Test',
      })
    ).rejects.toThrow();
  });
});
