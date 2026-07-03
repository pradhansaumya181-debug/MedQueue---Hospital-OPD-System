// tests/unit/slotService.test.js
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Doctor = require('../../src/models/Doctor');
const { generateSlotsForDate, getAvailableSlots, timeToMinutes, minutesToTime } = require('../../src/services/slotService');
const { hashPassword } = require('../../src/utils/hashPassword');

// Helper: Doctor banao
const createDoctor = async (workingHours = { start: '09:00', end: '17:00' }, availableDays = [0,1,2,3,4,5,6]) => {
  const adminUser = await User.create({
    name: 'Admin', email: `admin${Date.now()}@test.com`,
    role: 'admin', password: await hashPassword('Admin@123'),
  });
  const doctorUser = await User.create({
    name: 'Dr. Slot Test', email: `slotdoc${Date.now()}@test.com`,
    role: 'doctor', password: await hashPassword('Doctor@123'),
  });
  const doctor = await Doctor.create({
    userId: doctorUser._id,
    specialization: 'General', qualification: 'MBBS',
    experience: 5, registrationNumber: `MCI${Date.now()}`,
    consultationFee: 300, hospitalId: adminUser._id,
    availableDays, workingHours,
  });
  return doctor;
};

describe('Slot Service', () => {

  describe('timeToMinutes & minutesToTime', () => {
    test('timeToMinutes converts correctly', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('09:00')).toBe(540);
      expect(timeToMinutes('09:30')).toBe(570);
      expect(timeToMinutes('17:00')).toBe(1020);
    });

    test('minutesToTime converts correctly', () => {
      expect(minutesToTime(0)).toBe('00:00');
      expect(minutesToTime(540)).toBe('09:00');
      expect(minutesToTime(570)).toBe('09:30');
      expect(minutesToTime(605)).toBe('10:05');  // Leading zero test
    });
  });

  describe('generateSlotsForDate', () => {
    test('should generate correct number of 15-min slots', async () => {
      const doctor = await createDoctor({ start: '09:00', end: '17:00' });
      // 9am-5pm = 8 hours = 480 min / 15 min = 32 slots
      const slots = await generateSlotsForDate(doctor._id, '2024-06-17'); // Monday
      expect(slots.length).toBe(32);
    });

    test('first slot should start at working hours start', async () => {
      const doctor = await createDoctor({ start: '10:00', end: '14:00' });
      const slots = await generateSlotsForDate(doctor._id, '2024-06-17');
      expect(slots[0].startTime).toBe('10:00');
      expect(slots[0].endTime).toBe('10:15');
    });

    test('last slot should end at or before working hours end', async () => {
      const doctor = await createDoctor({ start: '09:00', end: '09:30' });
      const slots = await generateSlotsForDate(doctor._id, '2024-06-17');
      expect(slots.length).toBe(2);
      expect(slots[slots.length - 1].endTime).toBe('09:30');
    });

    test('all slots should be unbooked initially', async () => {
      const doctor = await createDoctor({ start: '09:00', end: '10:00' });
      const slots = await generateSlotsForDate(doctor._id, '2024-06-17');
      slots.forEach(slot => {
        expect(slot.isBooked).toBe(false);
        expect(slot.appointmentId).toBeNull();
      });
    });

    test('should return existing slots without regenerating', async () => {
      const doctor = await createDoctor({ start: '09:00', end: '10:00' });
      const date = '2024-06-17';

      const slots1 = await generateSlotsForDate(doctor._id, date);
      const slots2 = await generateSlotsForDate(doctor._id, date);

      // Same IDs hone chahiye — regenerate nahi hua
      expect(slots1.length).toBe(slots2.length);
      expect(slots1.length).toBe(slots2.length);
    });

    test('should throw error for unavailable day', async () => {
      // availableDays = [1,2,3,4,5] — Sunday (0) available nahi
      const doctor = await createDoctor({ start: '09:00', end: '17:00' }, [1, 2, 3, 4, 5]);
      // 2024-06-16 = Sunday
      await expect(generateSlotsForDate(doctor._id, '2024-06-16'))
        .rejects.toThrow('not available');
    });

    test('should throw error for non-existent doctor', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(generateSlotsForDate(fakeId, '2024-06-17'))
        .rejects.toThrow('Doctor not found');
    });
  });

  describe('getAvailableSlots', () => {
    test('should return only unbooked slots', async () => {
      const doctor = await createDoctor({ start: '09:00', end: '09:30' });
      const date = '2024-06-17';

      // Pehle generate karo
      const allSlots = await generateSlotsForDate(doctor._id, date);

      // Manually pehla slot book karo
      const dbDoctor = await Doctor.findById(doctor._id);
      dbDoctor.slots.get(date)[0].isBooked = true;
      dbDoctor.markModified(`slots.${date}`);
      await dbDoctor.save();

      // Available slots mein sirf unbooked aane chahiye
      const available = await getAvailableSlots(doctor._id, date);
      expect(available.length).toBe(allSlots.length - 1);
      available.forEach(s => expect(s.isBooked).toBe(false));
    });
  });
});
