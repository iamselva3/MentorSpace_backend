import articleRepository from '../../repositories/articleRepository.js';
import AppError from '../../utils/AppError.js';

class UpdateArticleUseCase {
    async execute(articleId, updateData, teacherId) {
    
        const article = await articleRepository.findById(articleId);

        if (!article) {
            throw new AppError('Article not found', 404);
        }

        
        if (article.createdBy.toString() !== teacherId) {
            throw new AppError('You are not authorized to update this article', 403);
        }

        updateData.updatedAt = new Date();

        const updatedArticle = await articleRepository.update(articleId, updateData);

        return updatedArticle;
    }
}

export default new UpdateArticleUseCase();