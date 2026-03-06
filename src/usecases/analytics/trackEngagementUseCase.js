import analyticsRepository from '../../repositories/analyticsRepository.js';
import articleRepository from '../../repositories/articleRepository.js';

class TrackEngagementUseCase {
    async trackView(articleId, studentId) {
        await articleRepository.incrementViews(articleId, studentId);
        return await analyticsRepository.trackView(articleId, studentId);
    }

    async trackDuration(articleId, studentId, duration) {
        return await analyticsRepository.updateDuration(articleId, studentId, duration);
    }
}

export default new TrackEngagementUseCase();