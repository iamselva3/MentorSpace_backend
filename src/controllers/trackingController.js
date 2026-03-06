import trackEngagementUseCase from '../usecases/analytics/trackEngagementUseCase.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const trackView = catchAsync(async (req, res) => {
    const { articleId } = req.params;

    if (!articleId) {
        throw new AppError('Article ID is required', 400);
    }

    const analytics = await trackEngagementUseCase.trackView(articleId, req.user.id);

    res.status(200).json({
        status: 'success',
        data: { analytics }
    });
});

export const trackDuration = catchAsync(async (req, res) => {
    const { articleId } = req.params;
    const { duration } = req.body;

    if (!articleId || !duration) {
        throw new AppError('Article ID and duration are required', 400);
    }

    const analytics = await trackEngagementUseCase.trackDuration(
        articleId,
        req.user.id,
        duration
    );

    res.status(200).json({
        status: 'success',
        data: { analytics }
    });
});