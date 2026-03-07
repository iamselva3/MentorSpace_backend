import analyticsRepository from '../../repositories/analyticsRepository.js';
import articleRepository from '../../repositories/articleRepository.js';
import highlightRepository from '../../repositories/highlightRepository.js';
import AppError from '../../utils/AppError.js';

class GetStudentProgressUseCase {
  async execute(studentId, articleId) {
    if (!studentId || !articleId) {
      throw new AppError('Student ID and Article ID are required', 400);
    }

    // Check if article exists
    const article = await articleRepository.findById(articleId);
    if (!article) {
      throw new AppError('Article not found', 404);
    }

    // Get analytics for this student and article
    const analytics = await analyticsRepository.findByStudentAndArticle(studentId, articleId);
    
    // Get highlights for this student and article
    const highlights = await highlightRepository.findByStudentAndArticle(studentId, articleId);

    // Calculate progress
    const totalContentBlocks = article.contentBlocks?.length || 0;
    const viewedBlocks = analytics?.sessions?.length || 0;
    const progressPercentage = totalContentBlocks > 0 
      ? Math.min(Math.round((viewedBlocks / totalContentBlocks) * 100), 100) 
      : 0;

    // Calculate reading time
    const totalSeconds = analytics?.duration || 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
      articleId: article._id,
      articleTitle: article.title,
      category: article.category,
      progress: {
        percentage: progressPercentage,
        viewedBlocks,
        totalBlocks: totalContentBlocks,
        completed: progressPercentage === 100
      },
      readingTime: {
        totalSeconds,
        minutes,
        seconds,
        formatted: `${minutes}m ${seconds}s`
      },
      views: analytics?.views || 0,
      lastViewed: analytics?.lastViewed || null,
      highlights: highlights.map(h => ({
        id: h._id,
        text: h.text,
        note: h.note,
        color: h.color,
        timestamp: h.timestamp
      })),
      highlightsCount: highlights.length
    };
  }
}

export default new GetStudentProgressUseCase();