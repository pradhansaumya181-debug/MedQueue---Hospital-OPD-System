// src/controllers/admin.controller.js
// Admin ke powerful actions:
// - Doctor profile create karna
// - Bulk appointments cancel (updateMany) — resume mein mention!
// - Users manage karna
// - Hospital statistics dekhna

const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { HTTP_STATUS, ROLES, APPOINTMENT_STATUS } = require('../config/constants');

// ========================================
// DOCTOR PROFILE CREATE KARNA
// POST /api/admin/doctors
// Body: { userId, specialization, qualification, experience,
//         registrationNumber, consultationFee, availableDays, workingHours }
//
// Flow: Pehle /api/auth/register se doctor user banao
//       Phir yahan se doctor profile attach karo
// ========================================
const createDoctorProfile = async (req, res, next) => {
  try {
    const {
      userId,
      specialization,
      qualification,
      experience,
      registrationNumber,
      consultationFee,
      availableDays,
      workingHours,
    } = req.body;

    // User exist karta hai aur doctor role hai?
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found.');
    }
    if (user.role !== ROLES.DOCTOR) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'User must have doctor role.');
    }

    // Doctor profile already exist karta hai?
    const existingProfile = await Doctor.findOne({ userId });
    if (existingProfile) {
      return sendError(res, HTTP_STATUS.CONFLICT, 'Doctor profile already exists for this user.');
    }

    // Doctor profile create karo
    const doctor = await Doctor.create({
      userId,
      specialization,
      qualification,
      experience,
      registrationNumber,
      consultationFee,
      hospitalId: req.user.id,  // Admin ka ID = hospital ID
      availableDays: availableDays || [1, 2, 3, 4, 5],
      workingHours: workingHours || { start: '09:00', end: '17:00' },
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('userId', 'name email phone');

    return sendSuccess(res, HTTP_STATUS.CREATED, 'Doctor profile created successfully.', {
      doctor: populatedDoctor,
    });

  } catch (error) {
    next(error);
  }
};

// ========================================
// BULK CANCEL — updateMany
// Resume mein specifically mention hai: "updateMany handles bulk cancellations"
//
// POST /api/admin/appointments/bulk-cancel
// Body: { doctorId?, date?, reason }
//
// Use case: Doctor suddenly unavailable ho gaya
//           Ek click mein us din ke sab appointments cancel
// ========================================
const bulkCancelAppointments = async (req, res, next) => {
  try {
    const { doctorId, date, reason, status } = req.body;

    // Koi to filter hona chahiye — sara database cancel nahi kar sakte!
    if (!doctorId && !date) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'At least doctorId or date is required for bulk cancellation.'
      );
    }

    // Filter build karo
    const filter = {
      // Sirf active appointments cancel karo
      status: { $in: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.PENDING] },
    };

    if (doctorId) filter.doctorId = new mongoose.Types.ObjectId(doctorId);
    if (date) filter.date = date;

    // updateMany — ek query mein saare matching documents update
    // Ye wahi "updateMany" hai jo resume mein mention hai!
    // Individual cancel karte to N queries lagte, yahan sirf 1
    const result = await Appointment.updateMany(
      filter,
      {
        $set: {
          status: APPOINTMENT_STATUS.CANCELLED,
          statusNote: reason || 'Cancelled by hospital admin',
        },
      }
    );

    // TODO: Cancelled appointments ke patients ko notification bhejo
    // (Socket.io ya Firebase Cloud Messaging se)

    return sendSuccess(res, HTTP_STATUS.OK, 'Bulk cancellation successful.', {
      cancelledCount: result.modifiedCount,  // Kitne cancel hue
      matchedCount: result.matchedCount,     // Kitne match hue filter se
    });

  } catch (error) {
    next(error);
  }
};

// ========================================
// SAARE USERS LIST (with filters)
// GET /api/admin/users?role=doctor&page=1&limit=20
// ========================================
const getAllUsers = async (req, res, next) => {
  try {
    const { role, isBlocked, page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';

    // Name ya email mein search
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    return sendSuccess(res, HTTP_STATUS.OK, 'Users fetched.', {
      users,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    });

  } catch (error) {
    next(error);
  }
};

// ========================================
// USER BLOCK/UNBLOCK
// PATCH /api/admin/users/:id/toggle-block
// ========================================
const toggleUserBlock = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found.');
    }

    // Admin khud ko block nahi kar sakta
    if (user._id.toString() === req.user.id) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'You cannot block yourself.');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
      { user }
    );

  } catch (error) {
    next(error);
  }
};

// ========================================
// HOSPITAL STATISTICS
// GET /api/admin/stats
// ========================================
const getHospitalStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // MongoDB Aggregation Pipeline se stats nikalo
    // Ye ek powerful feature hai — multiple operations ek query mein
    const [stats] = await Appointment.aggregate([
      {
        $facet: {
          // Aaj ki appointments
          todayStats: [
            { $match: { date: today } },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              }
            }
          ],
          // Total appointments by status
          overallStats: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              }
            }
          ],
        }
      }
    ]);

    // User counts
    const [patientCount, doctorCount, adminCount] = await Promise.all([
      User.countDocuments({ role: ROLES.PATIENT }),
      User.countDocuments({ role: ROLES.DOCTOR }),
      User.countDocuments({ role: ROLES.ADMIN }),
    ]);

    // Active doctors
    const activeDoctors = await Doctor.countDocuments({ isActive: true });

    return sendSuccess(res, HTTP_STATUS.OK, 'Statistics fetched.', {
      users: { patients: patientCount, doctors: doctorCount, admins: adminCount },
      doctors: { total: doctorCount, active: activeDoctors },
      appointments: {
        today: stats.todayStats,
        overall: stats.overallStats,
      },
    });

  } catch (error) {
    next(error);
  }
};

// ========================================
// DOCTOR PROFILE UPDATE KARNA
// PUT /api/admin/doctors/:id
// Body: { specialization, consultationFee, availableDays, workingHours, isActive }
// ========================================
const updateDoctorProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Sirf ye fields update hone denge — userId aur registrationNumber nahi
    const allowedUpdates = [
      'specialization', 'qualification', 'experience',
      'consultationFee', 'availableDays', 'workingHours', 'isActive',
    ];

    // Sirf allowed fields filter karo
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'No valid fields provided for update.');
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }  // Mongoose validators chalao update par bhi
    ).populate('userId', 'name email phone');

    if (!doctor) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Doctor profile not found.');
    }

    return sendSuccess(res, HTTP_STATUS.OK, 'Doctor profile updated.', { doctor });

  } catch (error) {
    next(error);
  }
};

// ========================================
// DOCTOR PROFILE DELETE KARNA
// DELETE /api/admin/doctors/:id
// Soft delete — isActive: false karo, data mat hatao
// ========================================
const deleteDoctorProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Doctor profile not found.');
    }

    // Hard delete mat karo — future appointments ka data chahiye hoga
    // Soft delete: isActive = false kar do
    doctor.isActive = false;
    await doctor.save();

    // User account bhi deactivate karo
    await User.findByIdAndUpdate(doctor.userId, { isActive: false });

    return sendSuccess(res, HTTP_STATUS.OK, 'Doctor deactivated successfully.', {
      message: 'Doctor profile deactivated. Existing appointments are preserved.',
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctorProfile,
  updateDoctorProfile,    // ← naya
  deleteDoctorProfile,    // ← naya
  bulkCancelAppointments,
  getAllUsers,
  toggleUserBlock,
  getHospitalStats,
};
