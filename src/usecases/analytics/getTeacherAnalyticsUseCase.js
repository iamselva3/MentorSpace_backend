import analyticsRepository from '../../repositories/analyticsRepository.js';
import articleRepository from '../../repositories/articleRepository.js';
import mongoose from 'mongoose';

class GetTeacherAnalyticsUseCase {
    async execute(teacherId) {
       

        const teacherObjectId = typeof teacherId === 'string'
            ? new mongoose.Types.ObjectId(teacherId)
            : teacherId;

        const articles = await articleRepository.findByTeacher(teacherObjectId);
        const articleAnalytics = await analyticsRepository.getTeacherAnalytics(teacherObjectId);
        const categoryStats = await articleRepository.getCategoryStats();
        const dailyEngagement = await analyticsRepository.getDailyEngagement(teacherObjectId);


        const totalArticles = articles.length;
        const totalStudents = [...new Set(articles.flatMap(a => a.uniqueStudents || []))].length;
        const totalViews = articles.reduce((sum, a) => sum + (a.totalViews || 0), 0);
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