// src/services/slotService.js
// Doctor ke liye ek din ke time slots generate karna
//
// Example: 9am se 5pm, 15 min intervals
// → ["09:00-09:15", "09:15-09:30", ..., "16:45-17:00"]
// = 32 slots

const Doctor = require('../models/Doctor');
const { SLOT_DURATION_MINUTES, MAX_SLOTS_PER_DAY, } = require('../config/constants');

/**
 * Time string ko minutes mein convert karo
 * "09:30" → 570 (9*60 + 30)
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Minutes ko time string mein convert karo
 * 570 → "09:30"
 */
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  // padStart(2, '0') — "9:5" ki jagah "09:05" format
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Ek doctor ke liye ek specific date ke slots generate karo
 * Agar slots already exist karte hain to return karo
 * Nahi hain to create karo
 *
 * @param {string} doctorId - Doctor ka MongoDB ID
 * @param {string} date - "YYYY-MM-DD" format
 * @returns {Promise<Array>} Generated/existing slots
 */
const generateSlotsForDate = async (doctorId, date) => {
  // Doctor dhundo
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  // Check karo is date ke slots already hain ya nahi
  const existingSlots = doctor.slots.get(date);
  if (existingSlots && existingSlots.length > 0) {
    // Already exist karte hain — return karo
    return existingSlots;
  }

  // Date ka day of week nikalo (0=Sun, 1=Mon, ..., 6=Sat)
  const dateObj = new Date(`${date}T00:00:00`);
  const dayOfWeek = dateObj.getDay();
  console.log('Available Days:', doctor.availableDays);
console.log('Working Hours:', doctor.workingHours);
console.log('Day Of Week:', dayOfWeek);

  // Doctor us din available hai?
  if (!doctor.availableDays.includes(dayOfWeek)) {
    throw new Error(`Doctor is not available on ${date} (day ${dayOfWeek})`);
  }

  // Working hours se slots calculate karo
  const startMinutes = timeToMinutes(doctor.workingHours.start);  // 540 (9am)
  const endMinutes = timeToMinutes(doctor.workingHours.end);      // 1020 (5pm)
  const duration = SLOT_DURATION_MINUTES;                          // 15

  const slots = [];
  let current = startMinutes;

  // Har 15 minute mein ek slot banao
  while (current + duration <= endMinutes && slots.length < MAX_SLOTS_PER_DAY) {
    slots.push({
      startTime: minutesToTime(current),          // "09:00"
      endTime: minutesToTime(current + duration), // "09:15"
      isBooked: false,
      appointmentId: null,
    });
    current += duration;
  }

  // Doctor ke slots Map mein save karo
  doctor.slots.set(date, slots);
  doctor.markModified('slots');
  console.log('Generated slots:', slots.length);
  await doctor.save();

  return slots;
};

/**
 * Ek specific date ke available (unbooked) slots return karo
 * @param {string} doctorId
 * @param {string} date
 * @returns {Promise<Array>} Available slots
 */
const getAvailableSlots = async (doctorId, date) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error('Doctor not found');

  // Slots nahi hain to generate karo pehle
  let slots = doctor.slots.get(date);
  if (!slots || slots.length === 0) {
    slots = await generateSlotsForDate(doctorId, date);
  }

  // Sirf available slots filter karo
  return slots.filter(slot => !slot.isBooked);
};

module.exports = { generateSlotsForDate, getAvailableSlots, timeToMinutes, minutesToTime };
