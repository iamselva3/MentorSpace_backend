import AppError from '../utils/AppError.js';

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

export const isTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher') {
        return next(new AppError('This action is restricted to teachers only', 403));
    }
    next();
};

export const isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return next(new AppError('This action is restricted to students only', 403));
    }
    next();
};