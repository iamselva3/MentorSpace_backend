// import analyticsRepository from '../../repositories/analyticsRepository.js';
// import highlightRepository from '../../repositories/highlightRepository.js';

// class GetStudentAnalyticsUseCase {
//     async execute(studentId) {
//         const categoryAnalytics = await analyticsRepository.getStudentAnalytics(studentId);

//         const totalArticlesRead = categoryAnalytics.reduce((sum, cat) => sum + cat.articlesRead, 0);
//         const totalReadingTime = categoryAnalytics.reduce((sum, cat) => sum + cat.totalDuration, 0);
//         const recentHighlights = await highlightRepository.findByStudent(studentId);

//         return {
//             summary: {
//                 totalArticlesRead,
//                 totalReadingTime
//             },
//             categoryAnalytics,
//             recentHighlights
//         };
//     }
// }

// export default new GetStudentAnalyticsUseCase();


import analyticsRepository from '../../repositories/analyticsRepository.js';
import highlightRepository from '../../repositories/highlightRepository.js';

class GetStudentAnalyticsUseCase {
    async execute(studentId) {
        
        const categoryAnalytics = await analyticsRepository.getStudentAnalytics(studentId);

        console.log('Category analytics:', JSON.stringify(categoryAnalytics, null, 2));

        const totalArticlesRead = categoryAnalytics.reduce((sum, cat) =>
            sum + (cat.articlesRead || 0), 0
        );

        
        const totalReadingTimeInSeconds = categoryAnalytics.reduce((sum, cat) =>
            sum + (cat.totalDuration || 0), 0
        );

        console.log('Total reading time in seconds:', totalReadingTimeInSeconds);

        const recentHighlights = await highlightRepository.findByStudent(studentId);

        return {
            summary: {
                totalArticlesRead,
                totalReadingTime: totalReadingTimeInSeconds,
                totalReadingTimeFormatted: this.formatDuration(totalReadingTimeInSeconds)
            },
            categoryAnalytics: categoryAnalytics.map(cat => ({
                _id: cat.category,
                category: cat.category,
                totalDuration: cat.totalDuration,
                articlesRead: cat.articlesRead,
                totalViews: cat.totalViews,
                formattedDuration: this.formatDuration(cat.totalDuration)
            })),
            recentHighlights: recentHighlights.slice(0, 5)
        };
    }

    formatDuration(seconds) {
        if (!seconds || seconds === 0) return '0 min';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds < 60 && seconds > 0) parts.push(`${remainingSeconds}s`);

        return parts.join(' ') || '0 min';
    }
}

export default new GetStudentAnalyticsUseCase();