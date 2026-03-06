import articleRepository from '../../repositories/articleRepository.js';
import analyticsRepository from '../../repositories/analyticsRepository.js';
import highlightRepository from '../../repositories/highlightRepository.js';
import AppError from '../../utils/AppError.js';

class DeleteArticleUseCase {
    async execute(articleId, teacherId) {
        const article = await articleRepository.findById(articleId);

        if (!article) {
            throw new AppError('Article not found', 404);
        }

      
        if (article.createdBy.toString() !== teacherId) {
            throw new AppError('You are not authorized to delete this article', 403);
        }

     
        const analyticsDeleteResult = await analyticsRepository.deleteMany({ articleId });
        console.log(`Deleted ${analyticsDeleteResult.deletedCount} analytics records`);

       
        const highlightsDeleteResult = await highlightRepository.deleteMany({ articleId });
        console.log(`Deleted ${highlightsDeleteResult.deletedCount} highlights`);

      
        const deletedArticle = await articleRepository.delete(articleId);

        return {
            article: deletedArticle,
            deletedAnalytics: analyticsDeleteResult.deletedCount,
            deletedHighlights: highlightsDeleteResult.deletedCount
        };
    }
}

export default new DeleteArticleUseCase();