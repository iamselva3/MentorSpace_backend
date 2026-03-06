import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';


export const protect = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userRepository.findById(decoded.id);
        if (!user) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new AppError('Invalid token. Please log in again.', 401));
    }
});

// Role-based access control middleware
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


export const optionalAuth = catchAsync(async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userRepository.findById(decoded.id);
            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
      
        console.log('Optional auth failed:', error.message);
    }

    next();
});


export default {
    protect,
    restrictTo,
    isTeacher,
    isStudent,
    optionalAuth
};