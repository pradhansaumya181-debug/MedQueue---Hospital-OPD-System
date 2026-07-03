// src/controllers/patient.controller.js
// Patient ke saare actions yahan handle hote hain:
// - Doctor search ($or query)
// - Available slots dekhna
// - Appointment book karna (writeLock ke saath)
// - Apni appointments dekhna
// - Appointment cancel karna
// - Queue token dekhna

const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { bookSlot, cancelAppointment } = require('../services/bookingService');
const { getAvailableSlots, generateSlotsForDate } = require('../services/slotService');
const { getQueueInfo } = require('../services/queueService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { HTTP_STATUS, APPOINTMENT_STATUS } = require('../config/constants');

// ========================================
// DOCTOR SEARCH
// GET /api/patients/doctors/search?q=heart&specialization=Cardiologist&date=2024-01-15
//
// $or query — resume mein mention hai!
// "q" parameter se naam ya specialization mein search karo
// ========================================
const searchDoctors = async (req, res, next) => {
  try {
    const { q, specialization, date, page = 1, limit = 10 } = req.query;

    // Base filter — sirf active doctors
    const filter = { isActive: true };

    // Specialization filter agar diya gaya
    if (specialization) {
      filter.specialization = new RegExp(specialization, 'i');  // Case insensitive
    }

    // $or query — naam ya specialization mein se kisi mein bhi match karo
    // Ye wahi "$or" hai jo resume mein mention hai!
    // Example: q="heart" → Cardiology ya "Heart specialist" dono match honge
    if (q) {
      filter.$or = [
        { specialization: new RegExp(q, 'i') },
        { qualification: new RegExp(q, 'i') },
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Doctors fetch karo + user info populate karo
    const doctors = await Doctor.find(filter)
      .populate('userId', 'name email phone profilePicture')  // Doctor ka naam etc.
      .select('-slots')  // Slots mat bhejo — bahut bada data hai
      .sort({ rating: -1, experience: -1 })  // Best doctors pehle
      .skip(skip)
      .limit(Number(limit));

    // Total count for pagination
    const total = await Doctor.countDocuments(filter);

    return sendSuccess(res, HTTP_STATUS.OK, 'Doctors fetched successfully.', {
      doctors,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });

  } catch (error) {
    next(error);
  }
};

// ========================================
// AVAILABLE SLOTS DEKHNA
// GET /api/patients/doctors/:doctorId/slots?date=2024-01-15
// ========================================
const getDoctorSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Date is required. Format: YYYY-MM-DD');
    }

    // Date validate karo — past date par booking nahi hogi
    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Cannot book slots for past dates.');
    }

    // Doctor exist karta hai?
    const doctor = await Doctor.findById(doctorId).populate('userId', 'name specialization');
    if (!doctor || !doctor.isActive) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Doctor not found or not available.');
    }

    // Available slots lo (generate karo agar pehle se nahi hain)
    const availableSlots = await getAvailableSlots(doctorId, date);

    return sendSuccess(res, HTTP_STATUS.OK, 'Slots fetched successfully.', {
      doctor: {
        id: doctor._id,
        name: doctor.userId?.name,
        specialization: doctor.specialization,
        consultationFee: doctor.consultationFee,
        workingHours: doctor.workingHours,
      },
      date,
      availableSlots,
      totalAvailable: availableSlots.length,
    });

  } catch (error) {
    next(error);
  }
};

// ========================================
// APPOINTMENT BOOK KARNA
// POST /api/patients/appointments/book
// Body: { doctorId, date, slotId, reason }
//
// writeLock middleware pehle se active hoga is route par
// ========================================
const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, slotId, reason } = req.body;
    const patientId = req.user.id;  // authenticate middleware ne set kiya

    // Validation
    if (!doctorId || !date || !slotId) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'doctorId, date, and slotId are required.');
    }

    // Same patient same doctor same date par already booked?
    const existingBooking = await Appointment.findOne({
      patientId,
      doctorId,
      date,
      status: { $nin: [APPOINTMENT_STATUS.CANCELLED] }  // Cancelled ko ignore karo
    });

    if (existingBooking) {
      return sendError(
        res,
        HTTP_STATUS.CONFLICT,
        'You already have an appointment with this doctor on this date.'
      );
    }

    // Atomic booking service call karo
    // Ye service write lock ke andar chal rahi hai (middleware se)
    const appointment = await bookSlot({
      patientId,
      doctorId,
      date,
      slotId,
      reason,
    });

    return sendSuccess(res, HTTP_STATUS.CREATED, 'Appointment booked successfully!', {
      appointment,
    });

  } catch (error) {
    // Conflict error (slot already booked)
    if (error.statusCode === 409) {
      return sendError(res, HTTP_STATUS.CONFLICT, error.message);
    }
    next(error);
  }
};

// ========================================
// APNI APPOINTMENTS DEKHNA
// GET /api/patients/appointments?status=confirmed&page=1
// ========================================
const getMyAppointments = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { patientId };

    // Status filter agar diya gaya
    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const appointments = await Appointment.find(filter)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name profilePicture' },
        select: 'specialization consultationFee userId',
      })
      .sort({ date: -1, startTime: -1 })  // Newest first
      .skip(skip)
      .limit(Number(limit));

    const total = await Appointment.countDocuments(filter);

    return sendSuccess(res, HTTP_STATUS.OK, 'Appointments fetched successfully.', {
      appointments,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });

  } catch (error) {
    next(error);
  }
};

// ========================================
// APPOINTMENT CANCEL KARNA
// PATCH /api/patients/appointments/:id/cancel
// Body: { reason }
// ========================================
const cancelMyAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const patientId = req.user.id;

    // Pehle verify karo ki ye appointment is patient ki hai
    const appointment = await Appointment.findOne({ _id: id, patientId });
    if (!appointment) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Appointment not found.');
    }

    const cancelled = await cancelAppointment(id, patientId, reason);

    return sendSuccess(res, HTTP_STATUS.OK, 'Appointment cancelled successfully.', {
      appointment: cancelled,
    });

  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

// ========================================
// QUEUE TOKEN INFO
// GET /api/patients/queue/:doctorId?date=2024-01-15
// Waiting room mein "Your token: 5, Currently serving: 3"
// ========================================
const getQueueStatus = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    const patientId = req.user.id;

    if (!date) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Date is required.');
    }

    // Patient ka token number dhundo
    const myAppointment = await Appointment.findOne({
      patientId,
      doctorId,
      date,
      status: APPOINTMENT_STATUS.CONFIRMED,
    });

    // Overall queue info
    const queueInfo = await getQueueInfo(doctorId, date);

    return sendSuccess(res, HTTP_STATUS.OK, 'Queue status fetched.', {
      myToken: myAppointment?.tokenNumber || null,
      currentlyServing: queueInfo.currentlyServing,
      totalTokens: queueInfo.totalTokens,
      // Kitna wait karna hai (approx)
      estimatedWaitMinutes: myAppointment?.tokenNumber
        ? Math.max(0, (myAppointment.tokenNumber - queueInfo.currentlyServing) * 15)
        : null,
    });

  } catch (error) {
    next(error);
  }
};

// ========================================
// PATIENT PROFILE UPDATE
// PUT /api/patients/profile
// Body: { name, phone, profilePicture }
// ========================================
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Sirf safe fields update karne denge
    // Email aur role kabhi update nahi hogi
    const allowedFields = ['name', 'phone', 'profilePicture'];
    const updates = {};
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'No valid fields to update.');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, HTTP_STATUS.OK, 'Profile updated successfully.', { user });

  } catch (error) {
    next(error);
  }
};

// ========================================
// APPOINTMENT RESCHEDULE
// PATCH /api/patients/appointments/:id/reschedule
// Body: { newDate, newSlotId }
// Logic: purana cancel + naya book
// ========================================
const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, newSlotId } = req.body;
    const patientId = req.user.id;

    if (!newDate || !newSlotId) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'newDate and newSlotId are required.');
    }

    // Purana appointment verify karo
    const oldAppointment = await Appointment.findOne({ _id: id, patientId });
    if (!oldAppointment) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Appointment not found.');
    }

    if (['cancelled', 'completed'].includes(oldAppointment.status)) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        `Cannot reschedule a ${oldAppointment.status} appointment.`
      );
    }

    // Pehle purana cancel karo
    await cancelAppointment(id, patientId, 'Rescheduled by patient');

    // Phir naya book karo
    const newAppointment = await bookSlot({
      patientId,
      doctorId: oldAppointment.doctorId,
      date: newDate,
      slotId: newSlotId,
      reason: oldAppointment.reason,
    });

    return sendSuccess(res, HTTP_STATUS.OK, 'Appointment rescheduled successfully.', {
      oldAppointmentId: id,
      newAppointment,
    });

  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

module.exports = {
  searchDoctors,
  getDoctorSlots,
  bookAppointment,
  getMyAppointments,
  cancelMyAppointment,
  getQueueStatus,
  updateProfile,
  rescheduleAppointment,
};
