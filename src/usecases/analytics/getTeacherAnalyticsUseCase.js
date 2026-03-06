import analyticsRepository from '../../repositories/analyticsRepository.js';
import articleRepository from '../../repositories/articleRepository.js';

class GetTeacherAnalyticsUseCase {
    async execute(teacherId) {
        const articles = await articleRepository.findByTeacher(teacherId);
        const articleAnalytics = await analyticsRepository.getTeacherAnalytics(teacherId);
        const categoryStats = await articleRepository.getCategoryStats();
        const dailyEngagement = await analyticsRepository.getDailyEngagement(teacherId);

        const totalArticles = articles.length;
        const totalStudents = [...new Set(articles.flatMap(a => a.uniqueStudents))].length;
        const totalViews = articles.reduce((sum, a) => sum + a.totalViews, 0);
        const topCategories = categoryStats.slice(0, 3);

        return {
            summary: {
                totalArticles,
                totalStudents,
                totalViews
            },
            articleAnalytics,
            categoryStats,
            topCategories,
            dailyEngagement
        };
    }
}

export default new GetTeacherAnalyticsUseCase();