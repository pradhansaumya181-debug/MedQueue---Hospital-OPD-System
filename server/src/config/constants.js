//poore app mai use hone wala constant value

const ROLES = {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    ADMIN: 'admin',
};


//appointment ka possible status

const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    NO_SHOW: 'no_show',
};

const SLOT_DURATION_MINUTES = 15;

const MAX_SLOTS_PER_DAY = 40;


const HTTP_STATUS  = {

    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    INTERNAL_ERROR: 500,

}

module.exports = {ROLES, APPOINTMENT_STATUS, SLOT_DURATION_MINUTES, MAX_SLOTS_PER_DAY, HTTP_STATUS};
