import getTeacherAnalyticsUseCase from '../usecases/analytics/getTeacherAnalyticsUseCase.js';
import getStudentAnalyticsUseCase from '../usecases/analytics/getStudentAnalyticsUseCase.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const getTeacherAnalytics = catchAsync(async (req, res) => {
    if (req.user.role !== 'teacher') {
        throw new AppError('Only teachers can access teacher analytics', 403);
    }

    const analytics = await getTeacherAnalyticsUseCase.execute(req.user.id);

    res.status(200).json({
        status: 'success',
        data: analytics
    });
});

export const getStudentAnalytics = catchAsync(async (req, res) => {
    if (req.user.role !== 'student') {
        throw new AppError('Only students can access student analytics', 403);
    }

    const analytics = await getStudentAnalyticsUseCase.execute(req.user.id);

    res.status(200).json({
        status: 'success',
        data: analytics
    });
});


