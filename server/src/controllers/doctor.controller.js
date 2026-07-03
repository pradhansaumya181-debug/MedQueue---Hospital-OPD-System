// src/controllers/doctor.controller.js
// Doctor ke actions:
// - Aaj ki appointments dekhna
// - Slot generate karna (ek date ke liye)
// - Queue next token call karna
// - Appointment complete/no-show mark karna
// - Notes add karna

const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { generateSlotsForDate } = require('../services/slotService');
const { updateCurrentlyServing } = require('../services/queueService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { HTTP_STATUS, APPOINTMENT_STATUS } = require('../config/constants');

// ========================================
// DOCTOR KA PROFILE FETCH + SETUP
// GET /api/doctors/profile
// ========================================
const getDoctorProfile = async (req, res, next) => {
  try {
    // req.user.id = User model ka ID
    // Doctor model mein userId se dhundo
    const doctor = await Doctor.findOne({ userId: req.user.id })
      .populate('userId', 'name email phone profilePicture');

    if (!doctor) {
      return sendError(
        res,
        HTTP_STATUS.NOT_FOUND,
        'Doctor profile not found. Please contact admin to set up your profile.'
      );
    }

    return sendSuccess(res, HTTP_STATUS.OK, 'Profile fetched.', { doctor });
  } catch (error) {
    next(error);
  }
};

// ========================================
// AAJ KI APPOINTMENTS (Today's Queue)
// GET /api/doctors/appointments/today
// ========================================
const getTodayAppointments = async (req, res, next) => {
  try {
    // Doctor ka Doctor model ID chahiye
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Doctor profile not found.');
    }

    // Aaj ki date "YYYY-MM-DD" format mein
    const today = new Date().toISOString().split('T')[0];

    // Aaj ke sab confirmed/pending appointments
    const appointments = await Appointment.find({
      doctorId: doctor._id,
      date: today,
      status: { $nin: [APPOINTMENT_STATUS.CANCELLED] },
    })
      .populate('patientId', 'name email phone profilePicture')
      .sort({ tokenNumber: 1 });  // Token number order mein

    return sendSuccess(res, HTTP_STATUS.OK, "Today's appointments fetched.", {
      date: today,
      appointments,
      total: appointments.length,
    });

  } catch (error) {
    next(error);
  }
};

// ========================================
// KISI BHI DATE KI APPOINTMENTS
// GET /api/doctors/appointments?date=2024-01-15
// ========================================
const getAppointmentsByDate = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Date is required.');
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Doctor profile not found.');
    }

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      date,
    })
      .populate('patientId', 'name email phone')
      .sort({ tokenNumber: 1 });

    return sendSuccess(res, HTTP_STATUS.OK, 'Appointments fetched.', {
      date,
      appointments,
    });

  } catch (error) {
    next(error);
  }
};

// ========================================
// SLOTS GENERATE KARNA EK DATE KE LIYE
// POST /api/doctors/slots/generate
// Body: { date }
// ========================================
const generateSlots = async (req, res, next) => {
  try {
    const { date } = req.body;

    if (!date) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Date is required.');
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Doctor profile not found.');
    }

    const slots = await generateSlotsForDate(doctor._id, date);

    return sendSuccess(res, HTTP_STATUS.CREATED, 'Slots generated successfully.', {
      date,
      totalSlots: slots.length,
      slots,
    });

  } catch (error) {
    if (error.message.includes('not available')) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, error.message);
    }
    next(error);
  }
};

// ========================================
// NEXT PATIENT CALL KARO
// POST /api/doctors/queue/next
// Doctor "Next" button dabata hai → currently serving +1
// ========================================
const callNextPatient = async (req, res, next) => {
  try {
    const { date } = req.body;
    const today = date || new Date().toISOString().split('T')[0];

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Doctor profile not found.');
    }

    // Queue mein next token par ja
    const queueInfo = await updateCurrentlyServing(doctor._id, today);

    // Us token wale patient ka appointment dhundo
    const currentAppointment = await Appointment.findOne({
      doctorId: doctor._id,
      date: today,
      tokenNumber: queueInfo.currentlyServing,
      status: APPOINTMENT_STATUS.CONFIRMED,
    }).populate('patientId', 'name phone');

    return sendSuccess(res, HTTP_STATUS.OK, 'Next patient called.', {
      currentlyServing: queueInfo.currentlyServing,
      totalTokens: queueInfo.totalTokens,
      currentPatient: currentAppointment?.patientId || null,
    });

  } catch (error) {
    next(error);
  }
};

// ========================================
// APPOINTMENT STATUS UPDATE KARNA
// PATCH /api/doctors/appointments/:id/status
// Body: { status, notes }
// Doctor: completed, no_show mark kar sakta hai
// ========================================
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Doctor sirf ye statuses set kar sakta hai
    const allowedStatuses = [APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.NO_SHOW];
    if (!allowedStatuses.includes(status)) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        `Doctors can only set status to: ${allowedStatuses.join(', ')}`
      );
    }

    // Verify karo ki ye appointment is doctor ki hai
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const appointment = await Appointment.findOne({ _id: id, doctorId: doctor._id });

    if (!appointment) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Appointment not found.');
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    return sendSuccess(res, HTTP_STATUS.OK, 'Appointment updated.', { appointment });

  } catch (error) {
    next(error);
  }
};

// ========================================
// DOCTOR APNA PROFILE UPDATE KARE
// PUT /api/doctors/profile
// Doctor sirf kuch cheezein update kar sakta hai
// ========================================
const updateDoctorSelfProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Doctor ke allowed updates — fees aur hours adjust kar sakta hai
    const allowedFields = ['consultationFee', 'workingHours', 'availableDays'];
    const doctorUpdates = {};
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) doctorUpdates[f] = req.body[f];
    });

    // User info updates
    const userAllowed = ['name', 'phone', 'profilePicture'];
    const userUpdates = {};
    userAllowed.forEach(f => {
      if (req.body[f] !== undefined) userUpdates[f] = req.body[f];
    });

    // Doctor profile update
    const doctor = await Doctor.findOneAndUpdate(
      { userId },
      { $set: doctorUpdates },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone profilePicture');

    if (!doctor) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Doctor profile not found.');
    }

    // User info bhi update karo agar diya
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(userId, { $set: userUpdates });
    }

    return sendSuccess(res, HTTP_STATUS.OK, 'Profile updated.', { doctor });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorProfile,
  getTodayAppointments,
  getAppointmentsByDate,
  generateSlots,
  callNextPatient,
  updateAppointmentStatus,
  updateDoctorSelfProfile,
};
